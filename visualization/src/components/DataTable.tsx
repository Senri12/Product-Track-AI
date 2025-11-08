import { useState, useMemo } from 'react'
import { DataRow } from '../types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import './DataTable.css'

interface DataTableProps {
  data: DataRow[]
}

type SortField = keyof DataRow
type SortDirection = 'asc' | 'desc'

export default function DataTable({ data }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('f1')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const itemsPerPage = 50

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (aVal === null && bVal === null) return 0
      if (aVal === null) return 1
      if (bVal === null) return -1
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal)
      const bStr = String(bVal)
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }, [data, sortField, sortDirection])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, page])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' 
      ? <ChevronUp size={16} />
      : <ChevronDown size={16} />
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'number') {
      if (value === 0) return '0'
      return value.toFixed(2) + '%'
    }
    return String(value)
  }

  return (
    <div className="card data-table">
      <div className="table-header">
        <h2>📋 Таблица данных</h2>
        <div className="table-info">
          Показано {paginatedData.length} из {data.length} записей
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('version_label')}>
                <span>Версия</span> <SortIcon field="version_label" />
              </th>
              <th onClick={() => handleSort('model_name')}>
                <span>Модель</span> <SortIcon field="model_name" />
              </th>
              <th onClick={() => handleSort('prompt_id')}>
                <span>Промпт</span> <SortIcon field="prompt_id" />
              </th>
              <th onClick={() => handleSort('lecture_file')}>
                <span>Лекция</span> <SortIcon field="lecture_file" />
              </th>
              <th onClick={() => handleSort('f1')}>
                <span>F1</span> <SortIcon field="f1" />
              </th>
              <th onClick={() => handleSort('precision')}>
                <span>Precision</span> <SortIcon field="precision" />
              </th>
              <th onClick={() => handleSort('recall')}>
                <span>Recall</span> <SortIcon field="recall" />
              </th>
              <th onClick={() => handleSort('hallucination')}>
                <span>Hallucination</span> <SortIcon field="hallucination" />
              </th>
              <th onClick={() => handleSort('faithfulness')}>
                <span>Faithfulness</span> <SortIcon field="faithfulness" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index}>
                <td>{row.version_label}</td>
                <td>{row.model_name}</td>
                <td>{row.prompt_id}</td>
                <td className="lecture-cell">{row.lecture_file.replace('.tex', '')}</td>
                <td className={row.f1 !== null ? 'metric-cell' : ''}>
                  {formatValue(row.f1)}
                </td>
                <td className={row.precision !== null ? 'metric-cell' : ''}>
                  {formatValue(row.precision)}
                </td>
                <td className={row.recall !== null ? 'metric-cell' : ''}>
                  {formatValue(row.recall)}
                </td>
                <td className={row.hallucination !== null ? 'metric-cell' : ''}>
                  {formatValue(row.hallucination)}
                </td>
                <td className={row.faithfulness !== null ? 'metric-cell' : ''}>
                  {formatValue(row.faithfulness)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </button>
          <span>
            Страница {page} из {totalPages}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  )
}

