export interface DataRow {
  lecture_file: string
  source_folder: string
  version: string
  model_name: string
  prompt_id: string
  precision: number | null
  recall: number | null
  f1: number | null
  claim_recall: number | null
  context_precision: number | null
  context_utilization: number | null
  hallucination: number | null
  faithfulness: number | null
  version_label: string
}

export interface FilterState {
  versions: string[]
  models: string[]
  prompts: string[]
  lectures: string[]
  sources: string[]
}

export interface StatisticItem {
  label: string
  value: number | string
  format?: 'number' | 'percent'
}

