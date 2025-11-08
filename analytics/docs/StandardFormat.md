# Стандартный формат данных

## Описание

Все данные сконвертированы в стандартный формат согласно спецификации модели данных для упрощения обмена и анализа.

**🆕 ОБНОВЛЕНИЕ:** Скрипт объединяет данные из ОБЕИХ папок в единые версии:
- `analytics/` - основные эксперименты (Классификаторы)
- `2-file/` - эксперименты с RNN
- **Результат:** Все диалоги объединяются в папки `dialogs_v1_english`, `dialogs_v2_russian`, `dialogs_v3_russian_v2` (без дублирующих суффиксов)

## Созданные файлы

### 📊 Overall Reports (Общие отчеты)

#### 1. overall_report_combined.xlsx / .csv (761 KB / 2.4 MB)
**Объединенный отчет по всем версиям (analytics + 2-file)**

Содержит: 12,240 записей (4,125 + 4,050 + 4,065 по версиям)

**Поля:**
- `model_name` - название модели (gemma3, llama3.2, mistral, phi4-mini, deepseek-r1, granite3.2)
- `model_parameters` - размер модели (1.0B, 1.5B, 2.0B, 3.8B, 4.3B, 7.0B)
- `lecture_title` - название лекции (например, "1_Классификаторы_KNN_и_наивный_байес")
- `lecture_topic` - тема/вопрос (например, "Что такое метод k-ближайших соседей?")
- `system_prompt_id` - идентификатор промпта (prompt1-prompt15)
- `dialog_id` - идентификатор диалога (dialog0001-dialog2700)

**RAGChecker Metrics (Overall):**
- `f1` - F1-мера, баланс точности и полноты (%)
- `precision` - точность, доля правильных утверждений (%)
- `recall` - полнота, доля найденных правильных утверждений (%)

**RAGChecker Metrics (Retriever):**
- `claim_recall` - полнота поиска утверждений (%)
- `context_precision` - точность найденного контекста (%)

**RAGChecker Metrics (Generator):**
- `context_utilization` - использование контекста (%)
- `hallucination` - галлюцинации, доля выдуманных фактов (%)
- `faithfulness` - верность источнику (%)
- `noise_sensitivity` - чувствительность к шуму (%)
- `self_knowledge` - использование собственных знаний (%)

**Дополнительно (только в combined):**
- `version` - версия (v1_english, v2_russian, v3_russian_v2)

**Использование:**
```python
import pandas as pd
df = pd.read_csv('overall_report_combined.csv')

# Фильтр по модели
gemma_data = df[df['model_name'] == 'gemma3']

# Фильтр по версии
v3_data = df[df['version'] == 'v3_russian_v2']

# Статистика по моделям
model_stats = df.groupby('model_name')['overall_rating'].mean()
```

#### 2. overall_report_v1_english.xlsx / .csv (238 KB / 788 KB)
Объединенный отчет Version 1 (английские промпты из analytics + 2-file)
- **Записей:** 4,125 (2,700 + 1,425)

#### 3. overall_report_v2_russian.xlsx / .csv (233 KB / 773 KB)
Объединенный отчет Version 2 (русские промпты v1 из analytics + 2-file)
- **Записей:** 4,050 (2,700 + 1,350)

#### 4. overall_report_v3_russian_v2.xlsx / .csv (261 KB / 803 KB)
Объединенный отчет Version 3 (русские промпты v2 из analytics + 2-file) - **ЛУЧШАЯ ВЕРСИЯ**
- **Записей:** 4,065 (2,700 + 1,365)

---

### 📝 System Prompts (Системные промпты)

#### system_prompts_v1_english.xlsx / .csv / .json
Системные промпты для Version 1

**Поля:**
- `system_prompt_id` - идентификатор (prompt1-prompt15)
- `system_prompt` - текст промпта (английский)
- `description` - описание промпта
- `version` - версия (1.0)

**Пример:**
```json
{
  "system_prompt_id": "prompt1",
  "system_prompt": "You are a helpful educational assistant...",
  "description": "Basic educational prompt",
  "version": "1.0"
}
```

#### system_prompts_v2_russian.xlsx / .csv / .json
Системные промпты для Version 2 (русский язык)

#### system_prompts_v3_russian_v2.xlsx / .csv / .json
Системные промпты для Version 3 (русский язык, версия 2.0)

---

### 💬 Dialog Files (Файлы диалогов)

**Все диалоги из analytics/ и 2-file/ объединены в единые папки по версиям:**

#### dialogs_v1_english/ (2,700 файлов)
Диалоги Version 1 (analytics + 2-file)

#### dialogs_v2_russian/ (2,252 файла)
Диалоги Version 2 (analytics + 2-file)

#### dialogs_v3_russian_v2/ (1,502 файла)
Диалоги Version 3 (analytics + 2-file)

**Формат файла диалога:**
```json
{
  "metadata": {
    "dialog_id": "dialog0843",
    "model_name": "mistral",
    "model_parameters": "7.0B",
    "system_prompt_id": "prompt14",
    "lecture_title": "1_Классификаторы_KNN_и_наивный_байес",
    "lecture_topic": "Что такое евклидова метрика?",
    "f1": 38.5,
    "precision": 36.2,
    "recall": 49.9,
    "claim_recall": 35.5,
    "context_precision": 50.0,
    "context_utilization": 31.9,
    "hallucination": 10.8,
    "faithfulness": 34.2,
    "noise_sensitivity": 20.2,
    "self_knowledge": 5.0,
    "timestamp": "2025-10-28T13:24:20.202606"
  },
  "turns": [
    {
      "turn_number": 1,
      "role": "user",
      "content": "Что такое евклидова метрика?",
      "model_response": "",
      "rating": ""
    },
    {
      "turn_number": 2,
      "role": "assistant",
      "content": "",
      "model_response": "Евклидова метрика – это ...",
      "rating": ""
    }
  ]
}
```

**Поля turns:**
- `turn_number` - порядковый номер реплики
- `role` - кто говорит ("user" или "assistant")
- `content` - вопрос пользователя (для user) или пусто (для assistant)
- `model_response` - ответ модели (для assistant) или пусто (для user)
- `rating` - оценка ответа (1-10, опционально)

---

## Структура директории

```
standard_format_output/
│
├── overall_report_combined.xlsx       # Объединенный отчет (все версии)
├── overall_report_combined.csv
│
├── overall_report_v1_english.xlsx     # Отчет Version 1
├── overall_report_v1_english.csv
├── overall_report_v2_russian.xlsx     # Отчет Version 2
├── overall_report_v2_russian.csv
├── overall_report_v3_russian_v2.xlsx  # Отчет Version 3
├── overall_report_v3_russian_v2.csv
│
├── system_prompts_v1_english.xlsx     # Промпты V1
├── system_prompts_v1_english.csv
├── system_prompts_v1_english.json
├── system_prompts_v2_russian.xlsx     # Промпты V2
├── system_prompts_v2_russian.csv
├── system_prompts_v2_russian.json
├── system_prompts_v3_russian_v2.xlsx  # Промпты V3
├── system_prompts_v3_russian_v2.csv
├── system_prompts_v3_russian_v2.json
│
├── dialogs_v1_english/                # Диалоги V1 (2700 файлов)
│   ├── dialog0001.json
│   ├── dialog0002.json
│   └── ...
│
├── dialogs_v2_russian/                # Диалоги V2 (2700 файлов)
│   ├── dialog0001.json
│   └── ...
│
└── dialogs_v3_russian_v2/             # Диалоги V3 (2700 файлов)
    ├── dialog0001.json
    └── ...
```

---

## Статистика

### Общая статистика

| Параметр | Значение |
|----------|---------|
| **Всего записей** | 8100 (2700 × 3) |
| **Версий** | 3 |
| **Моделей** | 6 |
| **Промптов** | 15 |
| **Диалогов** | 2700 на версию |
| **Лекций** | 15 |

### По версиям

| Версия | Записей | F1, % | Precision, % | Recall, % | Язык |
|--------|---------|-------|--------------|-----------|------|
| v1_english | 2700 | 26.26 | 28.25 | 39.91 | Английский |
| v2_russian | 2700 | 28.34 | 31.13 | 38.41 | Русский |
| v3_russian_v2 ⭐ | 2700 | **33.33** | **39.50** | **44.50** | Русский |

**⭐ Version 3 показывает лучшие результаты по всем основным метрикам!**

### По моделям

| Модель | Параметры | Диалогов (всего) |
|--------|-----------|-----------------|
| gemma3 | 4.3B | 1350 (450 × 3) |
| mistral | 7.0B | 1350 (450 × 3) |
| phi4-mini | 3.8B | 1350 (450 × 3) |
| llama3.2 | 1.0B | 1350 (450 × 3) |
| deepseek-r1 | 1.5B | 1350 (450 × 3) |
| granite3.2 | 2.0B | 1350 (450 × 3) |

### По промптам

15 промптов × 6 моделей × 30 диалогов × 3 версии = 8100 записей

---

## Примеры использования

### Python - pandas

```python
import pandas as pd
import json

# 1. Загрузка overall_report
df = pd.read_excel('overall_report_combined.xlsx')

# 2. Фильтрация по версии и модели
v3_gemma = df[
    (df['version'] == 'v3_russian_v2') &
    (df['model_name'] == 'gemma3')
]

# 3. Статистика по промптам для Version 3
v3_prompts = df[df['version'] == 'v3_russian_v2'].groupby('system_prompt_id').agg({
    'overall_rating': ['mean', 'count']
})

# 4. Загрузка диалога
with open('dialogs_v3_russian_v2/dialog0843.json', 'r', encoding='utf-8') as f:
    dialog = json.load(f)

print(f"Модель: {dialog['metadata']['model_name']}")
print(f"Тема: {dialog['metadata']['lecture_topic']}")
for turn in dialog['turns']:
    if turn['role'] == 'user':
        print(f"User: {turn['content']}")
    else:
        print(f"Assistant: {turn['model_response'][:100]}...")
```

### Python - загрузка промптов

```python
import json

# Загрузка промптов
with open('system_prompts_v3_russian_v2.json', 'r', encoding='utf-8') as f:
    prompts = json.load(f)

# Поиск промпта
prompt14 = next(p for p in prompts if p['system_prompt_id'] == 'prompt14')
print(prompt14['system_prompt'])
```

### Pandas - сравнение версий

```python
import pandas as pd

df = pd.read_csv('overall_report_combined.csv')

# Средний рейтинг по версиям
version_stats = df.groupby('version')['overall_rating'].agg([
    ('Средний', 'mean'),
    ('Мин', 'min'),
    ('Макс', 'max'),
    ('Количество', 'count')
])

print(version_stats)

# Лучшие промпты в Version 3
v3 = df[df['version'] == 'v3_russian_v2']
best_prompts = v3.groupby('system_prompt_id')['overall_rating'].mean().sort_values(ascending=False).head(5)
print("Топ-5 промптов в V3:")
print(best_prompts)
```

---

## Повторная конвертация

Если вы обновили исходные данные, запустите:

```bash
python3 convert_to_standard_format.py
```

Скрипт автоматически:
1. Сканирует все 3 версии (v1, v2, v3)
2. Конвертирует диалоги в стандартный формат
3. Создает overall_report для каждой версии
4. Генерирует объединенный отчет
5. Экспортирует system_prompts
6. Сохраняет все в папку `standard_format_output/`

---

## Соответствие спецификации

### ✅ Overall Report

| Поле | Реализовано | Описание |
|------|-------------|----------|
| model_name | ✅ | Название модели (gemma3, llama3.2, и т.д.) |
| model_parameters | ✅ | Размер модели (1.0B, 4.3B, 7.0B и т.д.) |
| lecture_title | ✅ | Название лекции из checking_inputs.json |
| lecture_topic | ✅ | Вопрос пользователя = тема |
| system_prompt_id | ✅ | Идентификатор промпта (prompt1-prompt15) |
| dialog_id | ✅ | Идентификатор диалога (dialog0001-dialog2700) |
| **f1** | ✅ | F1-мера RAGChecker (%) |
| **precision** | ✅ | Precision RAGChecker (%) |
| **recall** | ✅ | Recall RAGChecker (%) |
| **claim_recall** | ✅ | Claim Recall RAGChecker (%) |
| **context_precision** | ✅ | Context Precision RAGChecker (%) |
| **context_utilization** | ✅ | Context Utilization RAGChecker (%) |
| **hallucination** | ✅ | Hallucination RAGChecker (%) |
| **faithfulness** | ✅ | Faithfulness RAGChecker (%) |
| **noise_sensitivity** | ✅ | Noise Sensitivity RAGChecker (%) |
| **self_knowledge** | ✅ | Self-Knowledge RAGChecker (%) |

### ✅ Dialog Files

| Поле спецификации | Реализовано | Примечание |
|-------------------|-------------|------------|
| turn_number | ✅ | Порядковый номер |
| role | ✅ | user / assistant |
| content | ✅ | Вопрос пользователя |
| model_response | ✅ | Ответ модели |
| rating | ✅ | Опционально (сейчас пусто) |

**Дополнительно добавлено:**
- `metadata` секция с полной информацией о диалоге
- `timestamp` - время конвертации

### ✅ System Prompts

| Поле спецификации | Реализовано | Примечание |
|-------------------|-------------|------------|
| system_prompt_id | ✅ | prompt1-prompt15 |
| system_prompt | ✅ | Текст промпта |
| description | ✅ | Описание |
| version | ✅ | 1.0 или 2.0 |

---

## Форматы экспорта

### Excel (.xlsx)
- Удобно для ручного просмотра
- Поддержка фильтрации и сортировки
- Совместимо с Microsoft Excel, LibreOffice

### CSV (.csv)
- Универсальный формат
- Совместим со всеми инструментами анализа данных
- Легкий импорт в Python/R/SQL

### JSON (.json)
- Структурированный формат для промптов
- Легко парсится программно
- Поддержка вложенности (для диалогов)

---

## FAQ

**Q: Что означают метрики RAGChecker?**
A:
- **F1, Precision, Recall** - основные метрики качества ответов
- **Claim Recall** - насколько хорошо найдены все утверждения
- **Context Precision** - точность найденного контекста
- **Context Utilization** - насколько использован контекст
- **Hallucination** - доля выдуманных фактов (чем меньше, тем лучше)
- **Faithfulness** - верность источнику
- **Noise Sensitivity** - чувствительность к шуму в данных
- **Self-Knowledge** - использование собственных знаний модели

**Q: Почему в V1 и V2 многие метрики = 0?**
A: В этих версиях были доступны только базовые метрики (F1, Precision, Recall). Полный набор метрик RAGChecker появился в Version 3.

**Q: Что такое lecture_topic?**
A: Это первый вопрос пользователя в диалоге. Используется как тема/фрагмент лекции.

**Q: Можно ли добавить дополнительные поля?**
A: Да, отредактируйте скрипт `convert_to_standard_format.py` и добавьте нужные поля.

**Q: Где хранятся оригинальные данные?**
A: В папках ` version_1/`, `version_2/`, `version_3/`. Стандартный формат - это конвертированная копия.

---

## Рекомендации

### Для анализа данных:
1. Используйте **overall_report_combined.xlsx** для обзора
2. Фильтруйте по `version` для сравнения версий
3. Группируйте по `model_name` для сравнения моделей
4. Анализируйте по `system_prompt_id` для оценки промптов

### Для обмена данными:
1. CSV - для совместимости со всеми системами
2. JSON - для программного доступа
3. XLSX - для ручного просмотра

### Для Machine Learning:
1. Используйте JSON файлы диалогов как датасет
2. overall_report как метаданные для фильтрации
3. system_prompts для контекста

---

**Последнее обновление:** 28 октября 2025
**Версия:** 1.0
**Статус:** ✅ Готово к использованию

**Ключевые файлы:**
- 📊 overall_report_combined.xlsx - начните отсюда
- 💬 dialogs_v3_russian_v2/ - лучшая версия диалогов
- 📝 system_prompts_v3_russian_v2.json - лучшие промпты
