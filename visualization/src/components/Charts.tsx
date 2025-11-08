import { useState } from 'react'
import { DataRow } from '../types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './Charts.css'

interface ChartsProps {
  data: DataRow[]
}

export default function Charts({ data }: ChartsProps) {
  const [metric, setMetric] = useState<'f1' | 'precision' | 'recall' | 'hallucination'>('f1')

  // Группировка по моделям
  const modelData = data.reduce((acc, row) => {
    if (!row.model_name || row[metric] === null) return acc
    if (!acc[row.model_name]) {
      acc[row.model_name] = { model: row.model_name, values: [] }
    }
    acc[row.model_name].values.push(row[metric]!)
    return acc
  }, {} as Record<string, { model: string; values: number[] }>)

  const modelStats = Object.values(modelData).map(item => ({
    model: item.model,
    avg: item.values.reduce((a, b) => a + b, 0) / item.values.length,
    min: Math.min(...item.values),
    max: Math.max(...item.values),
    count: item.values.length
  })).sort((a, b) => b.avg - a.avg)

  // Группировка по версиям
  const versionData = data.reduce((acc, row) => {
    if (!row.version_label || row[metric] === null) return acc
    if (!acc[row.version_label]) {
      acc[row.version_label] = { version: row.version_label, values: [] }
    }
    acc[row.version_label].values.push(row[metric]!)
    return acc
  }, {} as Record<string, { version: string; values: number[] }>)

  const versionStats = Object.values(versionData).map(item => ({
    version: item.version,
    avg: item.values.reduce((a, b) => a + b, 0) / item.values.length,
    count: item.values.length
  }))

  // Группировка по промптам
  const promptData = data.reduce((acc, row) => {
    if (!row.prompt_id || row[metric] === null) return acc
    if (!acc[row.prompt_id]) {
      acc[row.prompt_id] = { prompt: row.prompt_id, values: [] }
    }
    acc[row.prompt_id].values.push(row[metric]!)
    return acc
  }, {} as Record<string, { prompt: string; values: number[] }>)

  const promptStats = Object.values(promptData)
    .map(item => ({
      prompt: item.prompt,
      avg: item.values.reduce((a, b) => a + b, 0) / item.values.length,
      count: item.values.length
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 15) // Топ 15 промптов

  const metricLabels = {
    f1: 'F1 Score',
    precision: 'Precision',
    recall: 'Recall',
    hallucination: 'Hallucination'
  }

  return (
    <div className="card charts">
      <div className="charts-header">
        <h2>📊 Графики</h2>
        <div className="metric-selector">
          <label>Метрика:</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value as any)}>
            <option value="f1">F1 Score</option>
            <option value="precision">Precision</option>
            <option value="recall">Recall</option>
            <option value="hallucination">Hallucination</option>
          </select>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Средние значения по моделям</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="avg" fill="#667eea" name={`Средний ${metricLabels[metric]}`} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Сравнение версий</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={versionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="version" />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="avg" fill="#48bb78" name={`Средний ${metricLabels[metric]}`} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Топ промптов</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={promptStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="prompt" />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="avg" fill="#ed8936" name={`Средний ${metricLabels[metric]}`} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Распределение по моделям (min/max/avg)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="max" fill="#48bb78" name="Максимум" />
              <Bar dataKey="avg" fill="#667eea" name="Среднее" />
              <Bar dataKey="min" fill="#e74c3c" name="Минимум" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

