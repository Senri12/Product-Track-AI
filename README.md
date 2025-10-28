# AI-Агент для образования

## 📌 Описание проекта
Проект представляет собой прототип образовательного AI-ассистента на базе больших языковых моделей (LLM), способного вести обучающий диалог со студентом строго на основе предоставленных лекционных материалов. Ассистент задаёт уточняющие вопросы, отвечает на вопросы по теории, предлагает задания и проверяет понимание студента. Для повышения точности используется RAG (Retrieval Augmented Generation) — поиск релевантных фрагментов лекции перед генерацией ответа.

---

## 🎯 Цель
Создать AI-агента, который может вести студента по материалу лекций, следуя фиксированному сценарию, диалоговым паттернам и опираясь только на загруженные документы. А также провести сравнение моделей и оценку качества диалогов.

---

## ✅ Возможности
- Ответы на вопросы по лекциям
- Контроль диалога с уточняющими вопросами
- Предложение практических задач
- Объяснение правильных ответов
- RAG-поиск информации в документах
- Автоматическая оценка качества ответов моделей через [RAGChecker](https://github.com/amazon-science/RAGChecker)
- Тестирование разных LLM через Ollama

---

## 🗂 Структура репозитория
```
.
├── analytic/                   # Аналитическая часть
├── documents/                  # Документы для RAG (лекции .txt)
│ ├── 1_Классификаторы_KNN_и_наивный_байес.txt    # Лекция 1
│ ├── 3. Инструменты обучения НС.txt              # Лекция 2
│ └── ...
│
├── first version/              # Диалоги первой версии промптов
│ ├── model_outputs             # см. Диалоги LLM по сценариям
│ ├── RAGChecker_outputs        # см. Статистика оценки качества диалогов
│ ├── checking_inputs.json      # Эталонные вопросы-ответы
│ ├── system_prompts.json       # Системные промпты
│ └── ...
│
├── second version/             # Диалоги второй версии промптов
│ ├── model_outputs             # см. Диалоги LLM по сценариям
│ ├── RAGChecker_outputs        # см. Статистика оценки качества диалогов
│ ├── checking_inputs.json      # Эталонные вопросы-ответы
│ ├── system_prompts.json       # Системные промпты
│ └── ...
│
├── second version + rag/       # Вторая версия с RAG-механикой
│ ├── model_outputs             # см. Диалоги LLM по сценариям
│ ├── RAGChecker_outputs        # см. Статистика оценки качества диалогов
│ ├── checking_inputs.json      # Эталонные вопросы-ответы
│ ├── system_prompts.json       # Системные промпты
│ └── ...
│
├── model_outputs/              # Диалоги LLM по сценариям
│ ├── имя 1 модели
│ │ ├── промпт 1/
│ │ │ ├── dialog0001.json      # Диалог 1
│ │ │ ├── dialog0002.json      # Диалог 2
│ │ │ └── ...
│ │ ├── промпт 2/
│ │ │ ├── dialog0001.json      # Диалог 1
│ │ │ ├── dialog0002.json      # Диалог 2
│ │ │ └── ...
│ ├── имя 2 модели/
│ │ ├── промпт 1/
│ │ │ ├── dialog0001.json      # Диалог 1
│ │ │ ├── dialog0002.json      # Диалог 2
│ │ │ └── ...
│ │ ├── промпт 2/
│ │ │ ├── dialog0001.json      # Диалог 1
│ │ │ ├── dialog0002.json      # Диалог 2
│ │ │ └── ...
│ │ └── ...
│ └── ...
│
├── RAGChecker_outputs/         # Статистика оценки качества диалогов
│ ├── имя 1 модели
│ │ ├── промпт 1/
│ │ │ └── ragchecker_report_deepseek-r1_1.5b_prompt1.json #отчёт по модели и промпту
│ │ ├── промпт 2/
│ │ │ └── ragchecker_report_deepseek-r1_1.5b_prompt1.json #отчёт по модели и промпту
│ ├── имя 2 модели/
│ │ ├── промпт 1/
│ │ │ └── ragchecker_report_deepseek-r1_1.5b_prompt1.json #отчёт по модели и промпту
│ │ ├── промпт 2/
│ │ │ └── ragchecker_report_deepseek-r1_1.5b_prompt1.json #отчёт по модели и промпту
│ │ └── ...
│ └── ...
│
├── checking_inputs.json        # Эталонные вопросы-ответы
├── system_prompts.json         # Системные промпты
├── evaluate_with_ragchecker.py # Скрипт оценки диалогов
├── llm_processor.py            # RAG-процессинг и база эмбеддингов
├── LICENSE
└── README.md
```
---

## 🔧 Требования

### Установите зависимости:
```
pip install -r requirements.txt
```

Нужно локально:
Python 3.10+
Ollama (установленные модели)
sentence-transformers
sklearn
torch
ragchecker
requests
sqlite

## 🚀 Запуск
1. Подготовка базы знаний
Положите лекции .txt в папку documents/. Базы эмбеддингов создаются автоматически при запуске.

3. Запуск оценки моделей
```
python evaluate_with_ragchecker.py
```
3. Результаты
После выполнения появятся:
model_outputs/ — диалоги по каждой модели
RAGChecker_outputs/ — отчёты качества
overall_report.csv — итоговая таблица оценок

---

## 🧠 Архитектура
LLM + RAG + Embeddings + Report Pipeline

## 📊 Данные экспериментов
Поле	              Описание
model_name	        Название LLM
lecture_title	      Название лекции
dialog_id	ID        диалога
system_prompt_id	  Сценарный промпт
overall_rating	    Оценка
evaluation_notes	  Замечания
overall_report.csv  Все записи

## 🧩 RAG-механика
Реализована в llm_processor.py:
Чанкирование лекций
Векторные эмбеддинги
Поиск ближайших chunk'ов
Передача контекста в LLM

## 📍 Пример запроса
```
from llm_processor import process_query
answer = process_query("Что такое метод k-NN?", "1_Классификаторы_KNN_и_наивный_байес", "qwen2:7b")
print(answer)
```
## ✅ Используемые технологии
Python
Ollama
Sentence Transformers
RAGChecker
Cosine Similarity
SQLite

## 🏁 Команда и роли
Шабуров Антон Андреевич — Инженер-разработчик (Architecture, RAG, LLM Integration, Evaluation Pipeline)
Терешкин Дмитрий Александрович — Инженер-аналитик (Data Preparation, Prompt Engineering, Experiment Design, Analysis)

## 📜 Лицензия
Проект распространяется по лицензии MIT (см. файл LICENSE).

## 📬 Контакты
Если у вас есть вопросы — обращайтесь через Issues в репозитории.
@Senri1 — Инженер-разработчик (Architecture, RAG, LLM Integration, Evaluation Pipeline)
@Otrix_ai — Инженер-аналитик (Data Preparation, Prompt Engineering, Experiment Design, Analysis)

---

