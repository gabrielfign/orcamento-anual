import { CategoryBlock } from '../components/CategoryBlock'
import { MonthStrip } from '../components/MonthStrip'
import { useStore } from '../store'
import { MONTH_LABELS, type SheetKind } from '../types'
import { averageFilled, sheetMonthTotals, sum } from '../calc'
import { formatMoney } from '../format'

export function SheetPage({ kind }: { kind: SheetKind }) {
  const {
    budget,
    viewMode,
    setViewMode,
    selectedMonth,
    setSelectedMonth,
    setItemValue,
    renameItem,
    renameCategory,
    addItem,
    removeItem,
    addCategory,
    removeCategory,
  } = useStore()

  const cats = kind === 'expenses' ? budget.expenses : budget.income
  const monthly = sheetMonthTotals(cats)
  const title = kind === 'expenses' ? 'Despesas' : 'Renda'
  const subtitle =
    kind === 'expenses'
      ? 'Lance os gastos do mês. Categorias e itens podem ser renomeados ou excluídos — o Resumo atualiza sozinho.'
      : 'Lance tudo o que entra no mês. O total alimenta a economia líquida e o saldo final.'

  return (
    <div className="page">
      <div className="page-hero">
        <div>
          <p className="eyebrow">{budget.year}</p>
          <h1>{title}</h1>
          <p className="lede">{subtitle}</p>
        </div>
        <div className={`hero-stat ${kind}`}>
          <span>{viewMode === 'mes' ? `Total de ${MONTH_LABELS[selectedMonth]}` : 'Total do ano'}</span>
          <strong>
            {formatMoney(viewMode === 'mes' ? monthly[selectedMonth] : sum(monthly), true) || 'R$ 0'}
          </strong>
          {viewMode === 'ano' && <small>média {formatMoney(averageFilled(monthly), true) || 'R$ 0'}</small>}
        </div>
      </div>

      <div className="toolbar">
        <MonthStrip year={budget.year} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
        <div className="toolbar-right">
          <div className="seg">
            <button type="button" className={viewMode === 'mes' ? 'is-active' : ''} onClick={() => setViewMode('mes')}>
              Mês
            </button>
            <button type="button" className={viewMode === 'ano' ? 'is-active' : ''} onClick={() => setViewMode('ano')}>
              Ano
            </button>
          </div>
          <button type="button" className="primary-btn" onClick={() => addCategory(kind)}>
            + categoria
          </button>
        </div>
      </div>

      <div className="stack">
        {cats.map((cat) => (
          <CategoryBlock
            key={cat.id}
            kind={kind}
            category={cat}
            year={budget.year}
            viewMode={viewMode}
            selectedMonth={selectedMonth}
            onValue={(itemId, month, value) => setItemValue(kind, cat.id, itemId, month, value)}
            onRenameItem={(itemId, name) => renameItem(kind, cat.id, itemId, name)}
            onRenameCategory={(name) => renameCategory(kind, cat.id, name)}
            onAddItem={() => addItem(kind, cat.id)}
            onRemoveItem={(itemId) => removeItem(kind, cat.id, itemId)}
            onRemoveCategory={() => {
              if (confirm(`Excluir a categoria “${cat.name}”?`)) removeCategory(kind, cat.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}
