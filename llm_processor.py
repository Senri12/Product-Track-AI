import sqlite3
import os
import requests
from typing import List, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModel
import torch

OLLAMA_URL = "http://localhost:11434/api/generate"

# Эмбеддинги
EMB_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
emb_model = AutoModel.from_pretrained(EMB_MODEL_NAME)
emb_tokenizer = AutoTokenizer.from_pretrained(EMB_MODEL_NAME)


def embed_text(text: str) -> np.ndarray:
    inputs = emb_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        model_output = emb_model(**inputs)
    return model_output.last_hidden_state[:, 0, :].numpy()[0]


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 200) -> List[str]:
    tokens = text.split()
    chunks, start = [], 0
    while start < len(tokens):
        chunks.append(" ".join(tokens[start:start + chunk_size]))
        start += chunk_size - overlap
    return chunks


def create_db_for_file(file_name: str) -> str:
    db_name = f"{file_name}.db"
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("""CREATE TABLE IF NOT EXISTS chunks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        chunk TEXT NOT NULL,
                        embedding BLOB NOT NULL
                      )""")
    conn.commit()
    conn.close()
    return db_name


def add_file_to_db(file_path: str):
    file_name = os.path.splitext(os.path.basename(file_path))[0]
    db_name = create_db_for_file(file_name)

    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    chunks = chunk_text(text)
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    for chunk in chunks:
        emb = embed_text(chunk).tobytes()
        cursor.execute("INSERT INTO chunks (chunk, embedding) VALUES (?, ?)", (chunk, emb))

    conn.commit()
    conn.close()
    print(f"✅ Файл '{file_name}' добавлен в базу {db_name}")
    return db_name


def ask_ollama(prompt: str, model_name: str, context: str = "") -> str:
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": model_name,
            "prompt": f"{context}\n\nВопрос: {prompt}\nОтвет:",
            "stream": False
        })
        return response.json().get("response", "")
    except Exception as e:
        return f"Ошибка: {str(e)}"
        

def process_query(query: str, db_name: str, model_name: str, top_k: int = 5) -> str:
    if not os.path.exists(db_name):
        return f"База {db_name} не найдена"

    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("SELECT chunk, embedding FROM chunks")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return "Нет данных в этой базе."

    chunks, embeddings = [], []
    for chunk, emb in rows:
        chunks.append(chunk)
        embeddings.append(np.frombuffer(emb, dtype=np.float32))
    embeddings = np.array(embeddings)

    query_emb = embed_text(query)
    sims = cosine_similarity([query_emb], embeddings)[0]
    top_idx = np.argsort(sims)[::-1][:top_k]

    context = "\n\n".join([chunks[i] for i in top_idx])
    return ask_ollama(query, model_name, context)