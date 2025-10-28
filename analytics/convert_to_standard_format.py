#!/usr/bin/env python3
"""
Скрипт для конвертации данных в стандартный формат
согласно модели данных из спецификации
"""

import pandas as pd
import json
import os
from pathlib import Path
from datetime import datetime

def extract_model_info(model_folder_name):
    """Извлечь информацию о модели из имени папки"""
    # Формат: model_name_size (например, gemma3_4b)
    parts = model_folder_name.rsplit('_', 1)
    if len(parts) == 2:
        model_name = parts[0].replace('_', ':')  # gemma3:4b
        size_str = parts[1].upper()  # 4B

        # Конвертируем размер в параметры
        size_map = {
            '1b': '1.0B', '1.5b': '1.5B', '2b': '2.0B',
            '3.8b': '3.8B', '4b': '4.3B', '7b': '7.0B'
        }
        model_parameters = size_map.get(parts[1].lower(), size_str)
    else:
        model_name = model_folder_name
        model_parameters = 'Unknown'

    return model_name, model_parameters

def load_lecture_info(checking_inputs_file):
    """Загрузить информацию о лекциях из checking_inputs.json"""
    if not os.path.exists(checking_inputs_file):
        return {}

    with open(checking_inputs_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    lecture_info = {}
    for item in data.get('data', []):
        file_name = item.get('file_name', '')
        # Извлекаем название из имени файла
        lecture_title = file_name.replace('.tex', '').strip()
        # Для каждого вопроса сохраняем информацию
        for qa in item.get('qas', []):
            query = qa.get('query', '')
            lecture_info[query] = {
                'lecture_title': lecture_title,
                'lecture_topic': query  # Тема = сам вопрос
            }

    return lecture_info

def load_ragchecker_metrics(version_path, model_folder_name, prompt_id):
    """Загрузить метрики RAGChecker для конкретной модели и промпта

    Args:
        version_path: Path - путь к версии (например, Path(' version_1'))
        model_folder_name: str - имя папки модели (например, 'gemma3_4b')
        prompt_id: str - ID промпта (например, 'prompt1')
    """
    # Ищем файл с результатами
    results_dir = version_path / 'RAGChecker_outputs'
    if not results_dir.exists():
        return {}

    # Формат имени файла: ragchecker_report_{model}_{prompt}.json
    results_file = results_dir / model_folder_name / prompt_id / f'ragchecker_report_{model_folder_name}_{prompt_id}.json'

    if not results_file.exists():
        return {}

    try:
        with open(results_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Извлекаем метрики из разных секций
        overall = data.get('overall_metrics', {})
        retriever = data.get('retriever_metrics', {})
        generator = data.get('generator_metrics', {})

        # Возвращаем все метрики
        return {
            'precision': overall.get('precision'),
            'recall': overall.get('recall'),
            'f1': overall.get('f1'),
            'claim_recall': retriever.get('claim_recall'),
            'context_precision': retriever.get('context_precision'),
            'context_utilization': generator.get('context_utilization'),
            'hallucination': generator.get('hallucination'),
            'faithfulness': generator.get('faithfulness'),
            'noise_sensitivity': generator.get('noise_sensitivity_in_relevant'),
            'self_knowledge': generator.get('self_knowledge')
        }
    except Exception as e:
        print(f"    ⚠ Ошибка загрузки метрик из {results_file}: {e}")
        return {}

def format_ragchecker_notes(metrics):
    """Форматировать метрики RAGChecker для evaluation_notes"""
    if not metrics:
        return 'No RAGChecker metrics available'

    notes_parts = []

    # Добавляем только ненулевые метрики
    metric_labels = {
        'claim_recall': 'Claim Recall',
        'context_precision': 'Context Precision',
        'context_utilization': 'Context Utilization',
        'hallucination': 'Hallucination',
        'faithfulness': 'Faithfulness',
        'noise_sensitivity': 'Noise Sensitivity',
        'self_knowledge': 'Self-Knowledge'
    }

    for key, label in metric_labels.items():
        value = metrics.get(key)
        if value is not None and value > 0:
            notes_parts.append(f"{label}: {value:.2f}%")

    return '; '.join(notes_parts) if notes_parts else 'All RAGChecker metrics are zero'

def convert_version_to_standard_format(version_path, version_name, output_dir):
    """Конвертировать одну версию в стандартный формат"""

    print(f"\n{'='*70}")
    print(f"Конвертация {version_name}")
    print(f"{'='*70}")

    version_path = Path(version_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)

    # Загружаем информацию о лекциях
    checking_inputs_file = version_path / 'checking_inputs.json'
    lecture_info = load_lecture_info(checking_inputs_file)
    print(f"Загружено {len(lecture_info)} записей о лекциях")

    # Загружаем системные промпты
    system_prompts_file = version_path / 'system_prompts.json'
    with open(system_prompts_file, 'r', encoding='utf-8') as f:
        system_prompts_data = json.load(f)

    # Конвертируем system_prompts в требуемый формат
    system_prompts_df = pd.DataFrame([
        {
            'system_prompt_id': p['system_prompt_id'],
            'system_prompt': p['system_prompt'],
            'description': p.get('description', ''),
            'version': p.get('version', '')
        }
        for p in system_prompts_data
    ])

    # Сохраняем system_prompts
    system_prompts_output = output_dir / f'system_prompts_{version_name}.xlsx'
    system_prompts_df.to_excel(system_prompts_output, index=False)
    system_prompts_df.to_csv(output_dir / f'system_prompts_{version_name}.csv', index=False)
    system_prompts_df.to_json(output_dir / f'system_prompts_{version_name}.json',
                              orient='records', indent=2, force_ascii=False)
    print(f"✓ Сохранено: system_prompts (xlsx, csv, json)")

    # Собираем overall_report
    overall_records = []
    dialogs_converted = 0

    model_outputs_path = version_path / 'model_outputs'

    if not model_outputs_path.exists():
        print(f"⚠ Папка не найдена: {model_outputs_path}")
        return

    # Создаем папку для диалогов
    dialogs_output_dir = output_dir / f'dialogs_{version_name}'
    dialogs_output_dir.mkdir(exist_ok=True)

    # Перебираем все модели
    for model_dir in model_outputs_path.iterdir():
        if not model_dir.is_dir():
            continue

        model_folder_name = model_dir.name
        model_name, model_parameters = extract_model_info(model_folder_name)

        print(f"\n  Модель: {model_name} ({model_parameters})")

        # Перебираем все промпты
        for prompt_dir in model_dir.iterdir():
            if not prompt_dir.is_dir():
                continue

            system_prompt_id = prompt_dir.name

            # Загружаем метрики RAGChecker для этой модели и промпта
            # Используем model_folder_name, а не model_name, чтобы сохранить формат gemma3_4b
            ragchecker_metrics = load_ragchecker_metrics(version_path, model_folder_name, system_prompt_id)

            # Перебираем все диалоги
            dialog_files = sorted(prompt_dir.glob('dialog*.json'))

            for dialog_file in dialog_files:
                dialog_id = dialog_file.stem  # Имя файла без расширения

                try:
                    # Читаем диалог
                    with open(dialog_file, 'r', encoding='utf-8') as f:
                        dialog_data = json.load(f)

                    if not dialog_data:
                        continue

                    # Получаем информацию о лекции из первого вопроса
                    first_user_turn = next((turn for turn in dialog_data
                                           if turn.get('role') == 'user'), None)

                    if first_user_turn:
                        first_query = first_user_turn.get('content', '')
                        lecture_data = lecture_info.get(first_query, {
                            'lecture_title': 'Unknown',
                            'lecture_topic': first_query
                        })
                    else:
                        lecture_data = {
                            'lecture_title': 'Unknown',
                            'lecture_topic': 'Unknown'
                        }

                    # Извлекаем метрики для отдельных столбцов
                    # Overall Metrics
                    f1 = ragchecker_metrics.get('f1') if ragchecker_metrics else None
                    precision = ragchecker_metrics.get('precision') if ragchecker_metrics else None
                    recall = ragchecker_metrics.get('recall') if ragchecker_metrics else None

                    # Retriever Metrics
                    claim_recall = ragchecker_metrics.get('claim_recall') if ragchecker_metrics else None
                    context_precision = ragchecker_metrics.get('context_precision') if ragchecker_metrics else None

                    # Generator Metrics
                    context_utilization = ragchecker_metrics.get('context_utilization') if ragchecker_metrics else None
                    hallucination = ragchecker_metrics.get('hallucination') if ragchecker_metrics else None
                    faithfulness = ragchecker_metrics.get('faithfulness') if ragchecker_metrics else None
                    noise_sensitivity = ragchecker_metrics.get('noise_sensitivity') if ragchecker_metrics else None
                    self_knowledge = ragchecker_metrics.get('self_knowledge') if ragchecker_metrics else None

                    # Добавляем запись в overall_report с разбивкой по столбцам
                    overall_records.append({
                        'model_name': model_name,
                        'model_parameters': model_parameters,
                        'lecture_title': lecture_data['lecture_title'],
                        'lecture_topic': lecture_data['lecture_topic'],
                        'system_prompt_id': system_prompt_id,
                        'dialog_id': dialog_id,
                        # Overall Metrics
                        'f1': f1,
                        'precision': precision,
                        'recall': recall,
                        # Retriever Metrics
                        'claim_recall': claim_recall,
                        'context_precision': context_precision,
                        # Generator Metrics
                        'context_utilization': context_utilization,
                        'hallucination': hallucination,
                        'faithfulness': faithfulness,
                        'noise_sensitivity': noise_sensitivity,
                        'self_knowledge': self_knowledge
                    })

                    # Конвертируем и сохраняем файл диалога
                    dialog_output = {
                        'metadata': {
                            'dialog_id': dialog_id,
                            'model_name': model_name,
                            'model_parameters': model_parameters,
                            'system_prompt_id': system_prompt_id,
                            'lecture_title': lecture_data['lecture_title'],
                            'lecture_topic': lecture_data['lecture_topic'],
                            # RAGChecker metrics
                            'f1': f1,
                            'precision': precision,
                            'recall': recall,
                            'claim_recall': claim_recall,
                            'context_precision': context_precision,
                            'context_utilization': context_utilization,
                            'hallucination': hallucination,
                            'faithfulness': faithfulness,
                            'noise_sensitivity': noise_sensitivity,
                            'self_knowledge': self_knowledge,
                            'timestamp': datetime.now().isoformat()
                        },
                        'turns': [
                            {
                                'turn_number': turn.get('turn_number', idx),
                                'role': turn.get('role', ''),
                                'content': turn.get('content', ''),
                                'model_response': turn.get('model_response', ''),
                                'rating': turn.get('rating', '')
                            }
                            for idx, turn in enumerate(dialog_data, 1)
                        ]
                    }

                    # Сохраняем диалог в JSON
                    dialog_output_file = dialogs_output_dir / f'{dialog_id}.json'
                    with open(dialog_output_file, 'w', encoding='utf-8') as f:
                        json.dump(dialog_output, f, ensure_ascii=False, indent=2)

                    dialogs_converted += 1

                    if dialogs_converted % 100 == 0:
                        print(f"    Обработано диалогов: {dialogs_converted}")

                except Exception as e:
                    print(f"    ✗ Ошибка при обработке {dialog_file}: {e}")

    print(f"\n  Всего диалогов обработано: {dialogs_converted}")

    # Создаем overall_report DataFrame
    overall_df = pd.DataFrame(overall_records)

    # Сохраняем overall_report в разных форматах
    overall_xlsx = output_dir / f'overall_report_{version_name}.xlsx'
    overall_csv = output_dir / f'overall_report_{version_name}.csv'

    overall_df.to_excel(overall_xlsx, index=False)
    overall_df.to_csv(overall_csv, index=False)

    print(f"\n✓ Сохранено: overall_report (xlsx, csv)")
    print(f"  Записей: {len(overall_df)}")
    print(f"  Моделей: {overall_df['model_name'].nunique()}")
    print(f"  Промптов: {overall_df['system_prompt_id'].nunique()}")
    print(f"  Диалогов: {overall_df['dialog_id'].nunique()}")

    return overall_df

def create_combined_report(output_dir):
    """Создать объединенный отчет по всем версиям"""

    output_dir = Path(output_dir)

    print(f"\n{'='*70}")
    print("Создание объединенного отчета")
    print(f"{'='*70}")

    # Собираем все overall_report файлы
    overall_files = list(output_dir.glob('overall_report_*.csv'))

    if not overall_files:
        print("✗ Не найдено файлов overall_report")
        return

    all_data = []
    for file in overall_files:
        version_name = file.stem.replace('overall_report_', '')
        df = pd.read_csv(file)
        df['version'] = version_name
        all_data.append(df)

    combined_df = pd.concat(all_data, ignore_index=True)

    # Сохраняем объединенный отчет
    combined_xlsx = output_dir / 'overall_report_combined.xlsx'
    combined_csv = output_dir / 'overall_report_combined.csv'

    combined_df.to_excel(combined_xlsx, index=False)
    combined_df.to_csv(combined_csv, index=False)

    print(f"✓ Сохранено: overall_report_combined (xlsx, csv)")
    print(f"  Всего записей: {len(combined_df)}")
    print(f"  Версий: {combined_df['version'].nunique()}")
    print(f"  Моделей: {combined_df['model_name'].nunique()}")

    # Статистика по версиям
    print("\nСтатистика по версиям:")
    for version in sorted(combined_df['version'].unique()):
        version_data = combined_df[combined_df['version'] == version]
        print(f"  {version}:")
        print(f"    Записей: {len(version_data)}")

def main():
    """Главная функция"""

    print("="*70)
    print("КОНВЕРТАЦИЯ В СТАНДАРТНЫЙ ФОРМАТ")
    print("="*70)

    # Определяем версии
    versions = {
        'v1_english': ' version_1',
        'v2_russian': 'version_2',
        'v3_russian_v2': 'version_3'
    }

    output_base_dir = 'standard_format_output'

    # Конвертируем каждую версию
    for version_name, version_path in versions.items():
        if os.path.exists(version_path):
            convert_version_to_standard_format(
                version_path,
                version_name,
                output_base_dir
            )
        else:
            print(f"\n⚠ Пропущено: {version_name} (путь не найден: {version_path})")

    # Создаем объединенный отчет
    create_combined_report(output_base_dir)

    print(f"\n{'='*70}")
    print("✅ КОНВЕРТАЦИЯ ЗАВЕРШЕНА!")
    print(f"{'='*70}")
    print(f"\nРезультаты сохранены в: {output_base_dir}/")
    print("\nСтруктура файлов:")
    print("  • overall_report_<version>.xlsx/csv - сводные отчеты")
    print("  • overall_report_combined.xlsx/csv - объединенный отчет")
    print("  • system_prompts_<version>.xlsx/csv/json - системные промпты")
    print("  • dialogs_<version>/<dialog_id>.json - файлы диалогов")

if __name__ == '__main__':
    main()
