import { useState } from 'react'
import { averageFilled, categoryMonthTotals, rowTotals, sum } from '../calc'
import { formatMoney, monthHeader } from '../format'
import { MONTHS, MONTH_LABELS, type Category, type SheetKind } from '../types'
import { MoneyCell } from './MoneyCell'

interface Props {
  kind: SheetKind
  category: Category
  year: number
  viewMode: 'mes' | 'ano'
  selectedMonth: number
  onValue: (itemId: string, month: number, value: number) => void
  onRenameItem: (itemId: string, name: string) => void
  onRenameCategory: (name: string) => void
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onRemoveCategory: () => void
}

export function CategoryBlock({
  kind,
  category,
  year,
  viewMode,
  selectedMonth,
  onValue,
  onRenameItem,
  onRenameCategory,
  onAddItem,
  onRemoveItem,
  onRemoveCategory,
}: Props) {
  const totals = categoryMonthTotals(category)
  const yearTotal = sum(totals)
  const yearAvg = averageFilled(totals)
  const accent = kind === 'income' ? 'income' : 'expense'

  return (
    <section className={`category-block ${accent}`}>
      <header className="category-head">
        <EditableText value={category.name} onChange={onRenameCategory} className="category-name" />
        <div className="category-actions">
          <button type="button" className="text-btn" onClick={onAddItem}>
            + item
          </button>
          <button type="button" className="text-btn danger" onClick={onRemoveCategory}>
            excluir
          </button>
        </div>
      </header>

      {viewMode === 'mes' ? (
        <div className="month-list">
          <div className="month-list-total">
            <span>Total mensal</span>
            <strong>{formatMoney(totals[selectedMonth], true) || 'R$ 0'}</strong>
          </div>
          {category.items.map((item) => (
            <div className="month-row" key={item.id}>
              <EditableText value={item.name} onChange={(n) => onRenameItem(item.id, n)} className="item-name" />
              <MoneyCell
                value={item.values[selectedMonth] ?? 0}
                onChange={(v) => onValue(item.id, selectedMonth, v)}
                ariaLabel={`${item.name} ${MONTH_LABELS[selectedMonth]}`}
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={`Remover ${item.name}`}
                onClick={() => onRemoveItem(item.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="sheet-scroll">
          <table className="sheet">
            <thead>
              <tr>
                <th className="sticky-col">Item</th>
                {Array.from({ length: MONTHS }, (_, m) => (
                  <th key={m} className={m === selectedMonth ? 'is-current' : ''}>
                    {monthHeader(m, year)}
                  </th>
                ))}
                <th className="col-total">Total</th>
                <th className="col-avg">Média</th>
                <th className="col-act" />
              </tr>
            </thead>
            <tbody>
              <tr className="total-row">
                <td className="sticky-col">Total mensal</td>
                {totals.map((v, m) => (
                  <td key={m} className={`num ${v ? 'is-filled' : ''} ${m === selectedMonth ? 'is-current' : ''}`}>
                    {formatMoney(v, true)}
                  </td>
                ))}
                <td className="num col-total">{formatMoney(yearTotal, true)}</td>
                <td className="num col-avg">{formatMoney(yearAvg, true)}</td>
                <td />
              </tr>
              {category.items.map((item) => {
                const { total, avg } = rowTotals(item.values)
                return (
                  <tr key={item.id}>
                    <td className="sticky-col">
                      <EditableText value={item.name} onChange={(n) => onRenameItem(item.id, n)} className="item-name" />
                    </td>
                    {item.values.map((v, m) => (
                      <td key={m} className={m === selectedMonth ? 'is-current' : ''}>
                        <MoneyCell
                          value={v}
                          onChange={(nv) => onValue(item.id, m, nv)}
                          ariaLabel={`${item.name} ${MONTH_LABELS[m]}`}
                        />
                      </td>
                    ))}
                    <td className="num col-total">{formatMoney(total, true)}</td>
                    <td className="num col-avg">{formatMoney(avg, true)}</td>
                    <td className="col-act">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Remover ${item.name}`}
                        onClick={() => onRemoveItem(item.id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function EditableText({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <button type="button" className={`editable ${className ?? ''}`} onClick={() => { setDraft(value); setEditing(true) }}>
        {value || 'sem nome'}
      </button>
    )
  }

  return (
    <input
      className={`editable is-editing ${className ?? ''}`}
      value={draft}
      autoFocus
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const next = draft.trim()
        if (next && next !== value) onChange(next)
        setEditing(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') setEditing(false)
      }}
    />
  )
}
