import json
import os
import re
import csv
from tqdm import tqdm
import ollama
import requests
from ragchecker import RAGChecker
from ragchecker.container import RAGResults, RAGResult, RetrievedDoc
from llm_processor import process_query, add_file_to_db

DOCUMENT_ROOT = "./documents"
RAGChecker_MODEL = "ollama/gemma3:12b"
MODEL_OUTPUTS = "./model_outputs"
SYSTEM_PROMPTS = "./system_prompts.json"
TEST_DATASET = "./checking_inputs.json"

all_documents = [os.path.join(DOCUMENT_ROOT, f) for f in os.listdir(DOCUMENT_ROOT) if f.endswith(".txt")]
db_names = []  # массив баз

for doc_path in all_documents:
    db = add_file_to_db(doc_path)
    db_names.append(db)
print(f"Созданы базы для документов: {db_names}")

def sanitize_filename(name):
    return re.sub(r'[<>:"/\\|?*:\s]', '_', name).strip('_')

# Загружаем тестовый датасет
with open(TEST_DATASET, "r", encoding="utf-8") as f:
    dataset = json.load(f)["data"]

# Список системных промптов (как в оригинале)
with open(SYSTEM_PROMPTS, "r", encoding="utf-8") as f:
    system_prompts = json.load(f)


# Директории
overall_records = []
dialog_counter = 1
available_models = [model['model'] for model in ollama.list()['models']]


for model_name in tqdm(available_models, desc="Обработка моделей"):
    model_dir = os.path.join(MODEL_OUTPUTS, sanitize_filename(model_name))
    rag_dir = os.path.join(RAGChecker_OUTPUTS, sanitize_filename(model_name))
    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(rag_dir, exist_ok=True)
    for sp in tqdm(system_prompts, desc=f"Промпты для модели {model_name}", leave=False):
        results_list = []
        
        for idx, item in enumerate(tqdm(dataset, desc="Обработка документов", leave=False)):
            file_name = item["file_name"]
            txt_file_path = os.path.join(DOCUMENT_ROOT, os.path.splitext(file_name)[0] + ".txt")
            
            lecture_title = file_name.split('.')[0] if file_name else "Unknown"
            lecture_topic = file_name

            # Выбираем соответствующую базу для документа
            db_name = db_names[idx] if idx < len(db_names) else None

            for qa in tqdm(item["qas"], desc="Обработка вопросов"):
                query = qa["query"]
                gt_answer = qa["gt_answer"]

                predicted_answer = process_query(
                    query=query,
                    db_name=db_name,
                    model_name=model_name
                )

                dialog_id = f"dialog{dialog_counter:04d}"

                # Сохраняем диалог
                dialog_data = [
                    {"turn_number": 1, "role": "user", "content": query, "model_response": "", "rating": ""},
                    {"turn_number": 2, "role": "assistant", "content": "", "model_response": predicted_answer, "rating": ""}
                ]
                prompt_name = sanitize_filename(sp['system_prompt_id'])
                prompt_dir = os.path.join(model_dir, prompt_name)
                os.makedirs(prompt_dir, exist_ok=True)
                with open(os.path.join(prompt_dir, f"{dialog_id}.json"), "w", encoding="utf-8") as f:
                    json.dump(dialog_data, f, ensure_ascii=False, indent=2)

                # Формируем результат для RAGChecker
                retrieved_context = [RetrievedDoc(doc_id=file_name, text=open(txt_file_path, "r", encoding="utf-8").read())] if os.path.exists(txt_file_path) else []
                results_list.append(
                    RAGResult(
                        query_id=dialog_id,
                        query=query,
                        gt_answer=gt_answer,
                        response=predicted_answer,
                        retrieved_context=retrieved_context
                    )
                )

                dialog_counter += 1

        # Запускаем RAGChecker с OpenRouter
        if results_list:
            rag_results = RAGResults(results=results_list)
            checker = RAGChecker(
                extractor_name=RAGChecker_MODEL,
                checker_name=RAGChecker_MODEL,
                batch_size_extractor=2,
                batch_size_checker=2
            )
            
            report = checker.evaluate(rag_results)

            # Сохраняем отчёт
            report_dir = os.path.join(rag_dir, sanitize_filename(sp['system_prompt_id']))
            os.makedirs(report_dir, exist_ok=True)
            report_filename = f"ragchecker_report_{sanitize_filename(model_name)}_{sp['system_prompt_id']}.json"
            with open(os.path.join(report_dir, report_filename), "w", encoding="utf-8") as f:
                json.dump(report, f, ensure_ascii=False, indent=2)

            # Извлекаем оценки (placeholder, можно адаптировать)
            for res in results_list:
                query_id = res.query_id
                overall_rating = report.get('results', {}).get(query_id, {}).get('score', 5)
                evaluation_notes = report.get('results', {}).get(query_id, {}).get('notes', 'Auto-evaluated')

                overall_records.append({
                    "model_name": model_name,
                    "lecture_title": lecture_title,
                    "lecture_topic": lecture_topic,
                    "system_prompt_id": sp["system_prompt_id"],
                    "dialog_id": query_id,
                    "overall_rating": overall_rating,
                    "evaluation_notes": evaluation_notes
                })

# Сохраняем общий отчёт
if overall_records:
    keys = overall_records[0].keys()
    with open("overall_report.csv", "w", encoding="utf-8", newline='') as f:
        dict_writer = csv.DictWriter(f, keys)
        dict_writer.writeheader()
        dict_writer.writerows(overall_records)

print("\nОценка завершена. Файлы сохранены: overall_report.csv, system_prompts.json, диалоговые json, отчёты RAGChecker.")








