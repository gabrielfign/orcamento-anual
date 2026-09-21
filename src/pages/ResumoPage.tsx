import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { averageFilled, categoryMonthTotals, sum, summarize } from '../calc'
import { formatMoney, monthHeader } from '../format'
import { useStore } from '../store'
import { MONTHS } from '../types'

function moneyTick(v: number) {
  const abs = Math.abs(v)
  if (abs >= 1000) return `${v < 0 ? '-' : ''}R$ ${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1).replace('.', ',')} mil`
  return formatMoney(v)
}

export function ResumoPage() {
  const { budget } = useStore()
  const s = summarize(budget)
  const leftover = s.currentBalance
  const leftoverLabel =
    s.lastFilledMonth >= 0
      ? `Saldo até ${monthHeader(s.lastFilledMonth, budget.year)}`
      : 'Saldo (ainda sem lançamentos)'

  const lineData = s.months.map((m) => ({
    name: monthHeader(m.month, budget.year),
    Renda: m.income,
    Despesas: m.expenses,
    'Saldo final': m.balance,
  }))

  const barData = budget.expenses.map((cat) => {
    const totals = categoryMonthTotals(cat)
    return { name: cat.name.replace(/\n/g, ' '), media: Math.round(averageFilled(totals)) }
  })

  return (
    <div className="page">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Resumo · {budget.year}</p>
          <h1>Quanto sobra</h1>
          <p className="lede">
            Esta página não se edita. Ela fecha a conta com o que você lançou em Despesas e Renda, a partir do saldo
            inicial.
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        <article className={`kpi leftover ${leftover < 0 ? 'is-neg' : leftover > 0 ? 'is-pos' : ''}`}>
          <span>{leftoverLabel}</span>
          <strong>{formatMoney(leftover) || 'R$ 0'}</strong>
          <small>
            Saldo inicial {formatMoney(budget.startingBalance) || 'R$ 0'} · no fim do ano{' '}
            {formatMoney(s.yearEndBalance) || 'R$ 0'}
          </small>
        </article>
        <article className="kpi">
          <span>Renda no ano</span>
          <strong>{formatMoney(s.incomeTotal) || 'R$ 0'}</strong>
          <small>média {formatMoney(s.incomeAvg) || 'R$ 0'}</small>
        </article>
        <article className="kpi">
          <span>Despesas no ano</span>
          <strong>{formatMoney(s.expensesTotal) || 'R$ 0'}</strong>
          <small>média {formatMoney(s.expensesAvg) || 'R$ 0'}</small>
        </article>
        <article className={`kpi ${s.netTotal < 0 ? 'is-neg' : 'is-pos'}`}>
          <span>Economia líquida</span>
          <strong>{formatMoney(s.netTotal) || 'R$ 0'}</strong>
          <small>renda − despesas · média {formatMoney(s.netAvg) || 'R$ 0'}</small>
        </article>
      </div>

      <section className="chart-card">
        <h2>Renda, despesas e saldo final</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e1d6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={moneyTick} width={72} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatMoney(Number(v)) || 'R$ 0'} />
              <Legend />
              <Line type="monotone" dataKey="Renda" stroke="#3d8c40" strokeWidth={2.4} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Despesas" stroke="#7eb8b9" strokeWidth={2.4} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Saldo final" stroke="#6b7280" strokeWidth={2.4} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <SummaryTable title="Resumo" year={budget.year} rows={[
        { name: 'Renda', values: s.incomeByMonth, total: s.incomeTotal, avg: s.incomeAvg },
        { name: 'Despesas', values: s.expensesByMonth, total: s.expensesTotal, avg: s.expensesAvg },
        { name: 'Economia líquida', values: s.netByMonth, total: s.netTotal, avg: s.netAvg },
        { name: 'Saldo final', values: s.balanceByMonth, total: s.yearEndBalance, avg: averageFilled(s.balanceByMonth) },
      ]} />

      <SummaryTable
        title="Renda"
        year={budget.year}
        rows={budget.income.map((cat) => {
          const values = categoryMonthTotals(cat)
          return { name: cat.name, values, total: sum(values), avg: averageFilled(values) }
        })}
      />

      <SummaryTable
        title="Despesas"
        year={budget.year}
        rows={budget.expenses.map((cat) => {
          const values = categoryMonthTotals(cat)
          return { name: cat.name, values, total: sum(values), avg: averageFilled(values) }
        })}
      />

      <section className="chart-card">
        <h2>Valor médio gasto por categoria</h2>
        <div className="chart-box tall">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e1d6" />
              <XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" tick={{ fontSize: 10 }} height={70} />
              <YAxis tickFormatter={moneyTick} width={72} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatMoney(Number(v)) || 'R$ 0'} />
              <Bar dataKey="media" name="Média" fill="#e8a598" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

interface TableRow {
  name: string
  values: number[]
  total: number
  avg: number
}

function SummaryTable({ title, year, rows }: { title: string; year: number; rows: TableRow[] }) {
  return (
    <section className="table-card">
      <h2>{title}</h2>
      <div className="sheet-scroll">
        <table className="sheet summary">
          <thead>
            <tr>
              <th className="sticky-col">{title}</th>
              {Array.from({ length: MONTHS }, (_, m) => (
                <th key={m}>{monthHeader(m, year)}</th>
              ))}
              <th className="col-total">Total</th>
              <th className="col-avg">Média</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="sticky-col">{row.name}</td>
                {row.values.map((v, m) => (
                  <td key={m} className={`num ${v ? 'is-filled' : ''}`}>
                    {formatMoney(v, true)}
                  </td>
                ))}
                <td className="num col-total">{formatMoney(row.total, true)}</td>
                <td className="num col-avg">{formatMoney(row.avg, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
