import { DataRow } from '../types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import './Comparison.css'

interface ComparisonProps {
  data: DataRow[]
}

export default function Comparison({ data }: ComparisonProps) {
  // Сравнение версий
  const versionComparison = data.reduce((acc, row) => {
    if (!row.version_label || row.f1 === null) return acc
    if (!acc[row.version_label]) {
      acc[row.version_label] = { version: row.version_label, values: [] }
    }
    acc[row.version_label].values.push(row.f1)
    return acc
  }, {} as Record<string, { version: string; values: number[] }>)

  const versionStats = Object.values(versionComparison).map(item => ({
    version: item.version,
    avg: item.values.reduce((a, b) => a + b, 0) / item.values.length,
    count: item.values.length
  })).sort((a, b) => {
    // Сортируем по порядку версий
    const order = ['v1_english', 'v2_russian', 'v3_russian_v2']
    return order.indexOf(a.version) - order.indexOf(b.version)
  })

  // Сравнение моделей
  const modelComparison = data.reduce((acc, row) => {
    if (!row.model_name || row.f1 === null) return acc
    if (!acc[row.model_name]) {
      acc[row.model_name] = { model: row.model_name, values: [] }
    }
    acc[row.model_name].values.push(row.f1)
    return acc
  }, {} as Record<string, { model: string; values: number[] }>)

  const modelStats = Object.values(modelComparison)
    .map(item => ({
      model: item.model,
      avg: item.values.reduce((a, b) => a + b, 0) / item.values.length,
      count: item.values.length
    }))
    .sort((a, b) => b.avg - a.avg)

  // Сравнение лекций
  const lectureComparison = data.reduce((acc, row) => {
    if (!row.lecture_file || row.f1 === null) return acc
    if (!acc[row.lecture_file]) {
      acc[row.lecture_file] = { lecture: row.lecture_file, values: [] }
    }
    acc[row.lecture_file].values.push(row.f1)
    return acc
  }, {} as Record<string, { lecture: string; values: number[] }>)

  const lectureStats = Object.values(lectureComparison).map(item => ({
    lecture: item.lecture.replace('.tex', ''),
    avg: item.values.reduce((a, b) => a + b, 0) / item.values.length,
    count: item.values.length
  }))

  const getTrendIcon = (current: number, previous: number | null) => {
    if (previous === null) return <Minus size={16} className="trend-neutral" />
    if (current > previous) return <TrendingUp size={16} className="trend-up" />
    if (current < previous) return <TrendingDown size={16} className="trend-down" />
    return <Minus size={16} className="trend-neutral" />
  }

  const getTrendValue = (current: number, previous: number | null) => {
    if (previous === null) return null
    const diff = current - previous
    return diff > 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`
  }

  return (
    <div className="card comparison">
      <h2>⚖️ Сравнение</h2>

      <div className="comparison-grid">
        <div className="comparison-section">
          <h3>Версии промптов</h3>
          <div className="comparison-list">
            {versionStats.map((stat, index) => {
              const previous = index > 0 ? versionStats[index - 1].avg : null
              return (
                <div key={stat.version} className="comparison-item">
                  <div className="comparison-header">
                    <span className="comparison-label">{stat.version}</span>
                    <div className="comparison-trend">
                      {getTrendIcon(stat.avg, previous)}
                      {previous !== null && (
                        <span className={stat.avg > previous ? 'trend-up' : stat.avg < previous ? 'trend-down' : 'trend-neutral'}>
                          {getTrendValue(stat.avg, previous)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="comparison-bar">
                    <div 
                      className="comparison-bar-fill"
                      style={{ width: `${(stat.avg / Math.max(...versionStats.map(s => s.avg))) * 100}%` }}
                    >
                      <span className="comparison-value">{stat.avg.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="comparison-count">{stat.count} записей</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="comparison-section">
          <h3>Модели (топ 10)</h3>
          <div className="comparison-list">
            {modelStats.slice(0, 10).map(stat => (
              <div key={stat.model} className="comparison-item">
                <div className="comparison-header">
                  <span className="comparison-label">{stat.model}</span>
                </div>
                <div className="comparison-bar">
                  <div 
                    className="comparison-bar-fill"
                    style={{ width: `${(stat.avg / modelStats[0].avg) * 100}%` }}
                  >
                    <span className="comparison-value">{stat.avg.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="comparison-count">{stat.count} записей</div>
              </div>
            ))}
          </div>
        </div>

        <div className="comparison-section">
          <h3>Лекции</h3>
          <div className="comparison-list">
            {lectureStats.map(stat => (
              <div key={stat.lecture} className="comparison-item">
                <div className="comparison-header">
                  <span className="comparison-label">{stat.lecture}</span>
                </div>
                <div className="comparison-bar">
                  <div 
                    className="comparison-bar-fill"
                    style={{ width: `${(stat.avg / Math.max(...lectureStats.map(s => s.avg))) * 100}%` }}
                  >
                    <span className="comparison-value">{stat.avg.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="comparison-count">{stat.count} записей</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

