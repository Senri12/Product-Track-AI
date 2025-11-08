import { DataRow } from '../types'
import { BarChart3, TrendingUp, Target, AlertTriangle } from 'lucide-react'
import './Statistics.css'

interface StatisticsProps {
  data: DataRow[]
}

export default function Statistics({ data }: StatisticsProps) {
  const validData = data.filter(d => d.f1 !== null)

  const calculateStats = (field: keyof DataRow) => {
    const values = validData
      .map(d => d[field])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v))
    
    if (values.length === 0) return { avg: 0, min: 0, max: 0, count: 0 }
    
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    }
  }

  const f1Stats = calculateStats('f1')
  const precisionStats = calculateStats('precision')
  const recallStats = calculateStats('recall')
  const hallucinationStats = calculateStats('hallucination')

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle,
    color 
  }: { 
    icon: any
    title: string
    value: string
    subtitle: string
    color: string
  }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ color }}>
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  )

  return (
    <div className="card statistics">
      <h2>📈 Статистика</h2>
      <div className="stats-grid">
        <StatCard
          icon={BarChart3}
          title="F1 Score"
          value={f1Stats.avg.toFixed(2) + '%'}
          subtitle={`min: ${f1Stats.min.toFixed(1)}%, max: ${f1Stats.max.toFixed(1)}%`}
          color="#667eea"
        />
        <StatCard
          icon={Target}
          title="Precision"
          value={precisionStats.avg.toFixed(2) + '%'}
          subtitle={`min: ${precisionStats.min.toFixed(1)}%, max: ${precisionStats.max.toFixed(1)}%`}
          color="#48bb78"
        />
        <StatCard
          icon={TrendingUp}
          title="Recall"
          value={recallStats.avg.toFixed(2) + '%'}
          subtitle={`min: ${recallStats.min.toFixed(1)}%, max: ${recallStats.max.toFixed(1)}%`}
          color="#ed8936"
        />
        <StatCard
          icon={AlertTriangle}
          title="Hallucination"
          value={hallucinationStats.avg.toFixed(2) + '%'}
          subtitle={`min: ${hallucinationStats.min.toFixed(1)}%, max: ${hallucinationStats.max.toFixed(1)}%`}
          color="#e74c3c"
        />
      </div>
      <div className="stats-footer">
        <span>Всего записей: {data.length}</span>
        <span>Валидных: {validData.length}</span>
      </div>
    </div>
  )
}

