import { FilterState } from '../types'
import { X } from 'lucide-react'
import './Filters.css'

interface FiltersProps {
  uniqueValues: {
    versions: string[]
    models: string[]
    prompts: string[]
    lectures: string[]
    sources: string[]
  }
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function Filters({ uniqueValues, filters, onFiltersChange }: FiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    const current = filters[key]
    const newFilters = {
      ...filters,
      [key]: current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
    }
    onFiltersChange(newFilters)
  }

  const clearFilter = (key: keyof FilterState) => {
    onFiltersChange({
      ...filters,
      [key]: []
    })
  }

  const clearAll = () => {
    onFiltersChange({
      versions: [],
      models: [],
      prompts: [],
      lectures: [],
      sources: []
    })
  }

  const FilterGroup = ({ 
    title, 
    filterKey, 
    values 
  }: { 
    title: string
    filterKey: keyof FilterState
    values: string[]
  }) => {
    const currentFilters = filters[filterKey] || []
    return (
      <div className="filter-group">
        <div className="filter-header">
          <h3>{title}</h3>
          {currentFilters.length > 0 && (
            <button 
              className="clear-btn"
              onClick={() => clearFilter(filterKey)}
              title="Очистить"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="filter-options">
          {values.map(value => (
            <label key={value} className="filter-option">
              <input
                type="checkbox"
                checked={currentFilters.includes(value)}
                onChange={() => updateFilter(filterKey, value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  const activeFiltersCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="card filters">
      <div className="filters-header">
        <h2>🔍 Фильтры</h2>
        {activeFiltersCount > 0 && (
          <button className="clear-all-btn" onClick={clearAll}>
            Очистить все ({activeFiltersCount})
          </button>
        )}
      </div>

      <FilterGroup title="Версии" filterKey="versions" values={uniqueValues.versions} />
      <FilterGroup title="Модели" filterKey="models" values={uniqueValues.models} />
      <FilterGroup title="Промпты" filterKey="prompts" values={uniqueValues.prompts} />
      <FilterGroup title="Лекции" filterKey="lectures" values={uniqueValues.lectures} />
      <FilterGroup title="Источники" filterKey="sources" values={uniqueValues.sources} />
    </div>
  )
}

