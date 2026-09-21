import { MONTH_LABELS } from '../types'

interface Props {
  year: number
  selectedMonth: number
  onSelectMonth: (month: number) => void
}

export function MonthStrip({ year, selectedMonth, onSelectMonth }: Props) {
  return (
    <div className="month-strip" role="tablist" aria-label="Meses">
      {MONTH_LABELS.map((label, i) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={i === selectedMonth}
          className={i === selectedMonth ? 'is-active' : ''}
          onClick={() => onSelectMonth(i)}
        >
          <span>{label}</span>
          <small>{year}</small>
        </button>
      ))}
    </div>
  )
}
