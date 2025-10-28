# Сводка по метрикам RAGChecker

## Сравнение версий

### Overall Metrics (Основные метрики)

| Метрика | V1 English | V2 Russian | V3 Russian v2 | Лучшая |
|---------|-----------|-----------|---------------|--------|
| **F1** | 26.26% | 28.34% | **33.33%** | V3 ⭐ |
| **Precision** | 28.25% | 31.13% | **39.50%** | V3 ⭐ |
| **Recall** | 39.91% | 38.41% | **44.50%** | V3 ⭐ |

### Retriever Metrics (Метрики поиска)

| Метрика | V1 English | V2 Russian | V3 Russian v2 |
|---------|-----------|-----------|---------------|
| **Claim Recall** | 0.00% | 0.00% | **36.20%** |
| **Context Precision** | 0.00% | 0.00% | **49.44%** |

### Generator Metrics (Метрики генерации)

| Метрика | V1 English | V2 Russian | V3 Russian v2 |
|---------|-----------|-----------|---------------|
| **Context Utilization** | 0.00% | 0.00% | **29.45%** |
| **Hallucination** ⚠️ | 0.00% | 0.00% | **10.22%** |
| **Faithfulness** | 0.00% | 0.00% | **32.59%** |
| **Noise Sensitivity** | 0.00% | 0.00% | **14.26%** |
| **Self-Knowledge** | 0.00% | 0.00% | **5.17%** |

⚠️ *Для Hallucination меньше = лучше*

## Выводы

### ✅ Сильные стороны V3
- **+7.07%** по F1 по сравнению с V1
- **+11.25%** по Precision по сравнению с V1
- **+4.59%** по Recall по сравнению с V1
- Полный набор метрик RAGChecker
- Высокая точность контекста (49.44%)

### ⚠️ Области для улучшения V3
- **Hallucination** (10.22%) - есть выдуманные факты
- **Faithfulness** (32.59%) - низкая верность источнику
- **Context Utilization** (29.45%) - недостаточное использование контекста

## Интерпретация метрик

### F1 Score (главная метрика)
- **>60%**: Отличное качество
- **40-60%**: Хорошее качество
- **20-40%**: Удовлетворительное качество ← V3 здесь (33.33%)
- **<20%**: Требует улучшения

### Precision (точность)
Доля правильных утверждений среди всех сгенерированных:
- V3: **39.50%** - каждое 2.5-е утверждение правильное

### Recall (полнота)
Доля найденных правильных утверждений:
- V3: **44.50%** - находим 44.5% правильных ответов

### Hallucination (галлюцинации)
Доля выдуманных фактов (чем меньше, тем лучше):
- V3: **10.22%** - каждое 10-е утверждение выдумано

### Faithfulness (верность)
Соответствие источнику:
- V3: **32.59%** - треть ответов строго соответствует источнику
- ⚠️ Низкое значение - требует внимания

## Примеры использования

### Python - фильтрация по метрикам

```python
import pandas as pd

# Загрузка данных
df = pd.read_csv('overall_report_v3_russian_v2.csv')

# Топ-5 диалогов по F1
top_f1 = df.nlargest(5, 'f1')[['dialog_id', 'model_name', 'f1', 'precision', 'recall']]
print("Топ-5 диалогов по F1:")
print(top_f1)

# Диалоги с низкой галлюцинацией (< 5%)
low_hallucination = df[df['hallucination'] < 5.0]
print(f"\nДиалогов с низкой галлюцинацией: {len(low_hallucination)}")

# Средние метрики по моделям
model_metrics = df.groupby('model_name')[['f1', 'precision', 'recall', 'hallucination']].mean()
print("\nСредние метрики по моделям:")
print(model_metrics.sort_values('f1', ascending=False))
```

### Python - поиск лучших промптов

```python
import pandas as pd

df = pd.read_csv('overall_report_v3_russian_v2.csv')

# Средние метрики по промптам
prompt_metrics = df.groupby('system_prompt_id').agg({
    'f1': 'mean',
    'precision': 'mean',
    'recall': 'mean',
    'hallucination': 'mean',
    'faithfulness': 'mean'
}).round(2)

# Сортируем по F1
best_prompts = prompt_metrics.sort_values('f1', ascending=False)
print("Лучшие промпты по F1:")
print(best_prompts.head(5))
```

### Python - анализ галлюцинаций

```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('overall_report_v3_russian_v2.csv')

# Корреляция между метриками
print("Корреляция hallucination с другими метриками:")
print(df[['hallucination', 'f1', 'precision', 'faithfulness']].corr()['hallucination'])

# Распределение галлюцинаций по моделям
hallucination_by_model = df.groupby('model_name')['hallucination'].agg(['mean', 'std', 'min', 'max'])
print("\nГаллюцинации по моделям:")
print(hallucination_by_model.sort_values('mean'))
```

## Рекомендации

### Для выбора лучшей модели
1. Используйте **F1** как основной критерий
2. Проверяйте **Hallucination** - должно быть < 5%
3. Смотрите на **Faithfulness** - должно быть > 50%

### Для выбора лучшего промпта
1. Фильтруйте по **F1 > 35%**
2. Ищите низкую **Hallucination < 8%**
3. Проверяйте **Context Utilization > 30%**

### Для улучшения результатов
1. **Увеличить Faithfulness**: улучшить промпты для строгого следования источнику
2. **Снизить Hallucination**: добавить инструкции "не выдумывай факты"
3. **Повысить Context Utilization**: оптимизировать использование контекста

---

**Дата:** 28 октября 2025  
**Версии:** V1 (English), V2 (Russian), V3 (Russian v2)  
**Лучшая версия:** V3 Russian v2 ⭐
