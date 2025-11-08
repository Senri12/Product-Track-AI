import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { DataRow, FilterState } from './types'
import Filters from './components/Filters'
import Statistics from './components/Statistics'
import Charts from './components/Charts'
import Comparison from './components/Comparison'
import DataTable from './components/DataTable'
import './App.css'

function App() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    versions: [],
    models: [],
    prompts: [],
    lectures: [],
    sources: []
  })

  useEffect(() => {
    // Загружаем данные из CSV файла
    fetch('/all_data.csv')
      .then(response => response.text())
      .then(csv => {
        Papa.parse<DataRow>(csv, {
          header: true,
          skipEmptyLines: true,
          transform: (value, field) => {
            // Конвертируем числовые поля
            const numericFields = [
              'precision', 'recall', 'f1', 'claim_recall', 
              'context_precision', 'context_utilization', 
              'hallucination', 'faithfulness'
            ]
            if (numericFields.includes(field)) {
              const num = parseFloat(value)
              return isNaN(num) ? null : num
            }
            return value
          },
          complete: (results) => {
            setData(results.data as DataRow[])
            setLoading(false)
          },
          error: (error) => {
            setError(error.message)
            setLoading(false)
          }
        })
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Получаем уникальные значения для фильтров
  const uniqueValues = {
    versions: [...new Set(data.map(d => d.version_label))].sort(),
    models: [...new Set(data.map(d => d.model_name))].sort(),
    prompts: [...new Set(data.map(d => d.prompt_id))].sort(),
    lectures: [...new Set(data.map(d => d.lecture_file))].sort(),
    sources: [...new Set(data.map(d => d.source_folder))].sort()
  }

  // Фильтруем данные
  const filteredData = data.filter(row => {
    if (filters.versions.length > 0 && !filters.versions.includes(row.version_label)) return false
    if (filters.models.length > 0 && !filters.models.includes(row.model_name)) return false
    if (filters.prompts.length > 0 && !filters.prompts.includes(row.prompt_id)) return false
    if (filters.lectures.length > 0 && !filters.lectures.includes(row.lecture_file)) return false
    if (filters.sources.length > 0 && !filters.sources.includes(row.source_folder)) return false
    return true
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <h2>Ошибка загрузки данных</h2>
        <p>{error}</p>
        <p>Убедитесь, что файл all_data.csv находится в папке public</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Product Track AI - Визуализация данных</h1>
        <p className="subtitle">Анализ качества языковых моделей</p>
      </header>

      <div className="container">
        <aside className="sidebar">
          <Filters
            uniqueValues={uniqueValues}
            filters={filters}
            onFiltersChange={setFilters}
          />
          <Statistics data={filteredData} />
        </aside>

        <main className="main-content">
          <Charts data={filteredData} />
          <Comparison data={filteredData} />
          <DataTable data={filteredData} />
        </main>
      </div>
    </div>
  )
}

export default App

