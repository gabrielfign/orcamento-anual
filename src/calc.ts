import { MONTHS, type Category, type YearBudget } from './types'

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0)
}

/** Média só dos meses com valor (como o Resumo de 2023: AVERAGEIF > 0). Zero não entra. */
export function averageFilled(nums: number[]): number {
  const filled = nums.filter((n) => n !== 0)
  if (filled.length === 0) return 0
  return sum(filled) / filled.length
}

export function categoryMonthTotals(category: Category): number[] {
  const totals = Array.from({ length: MONTHS }, () => 0)
  for (const item of category.items) {
    for (let m = 0; m < MONTHS; m++) {
      totals[m] += item.values[m] ?? 0
    }
  }
  return totals
}

export function sheetMonthTotals(categories: Category[]): number[] {
  const totals = Array.from({ length: MONTHS }, () => 0)
  for (const cat of categories) {
    const catTotals = categoryMonthTotals(cat)
    for (let m = 0; m < MONTHS; m++) totals[m] += catTotals[m]
  }
  return totals
}

export interface MonthSummary {
  month: number
  income: number
  expenses: number
  net: number
  balance: number
}

export interface BudgetSummary {
  incomeByMonth: number[]
  expensesByMonth: number[]
  netByMonth: number[]
  balanceByMonth: number[]
  months: MonthSummary[]
  incomeTotal: number
  expensesTotal: number
  netTotal: number
  incomeAvg: number
  expensesAvg: number
  netAvg: number
  lastFilledMonth: number
  currentBalance: number
  yearEndBalance: number
}

/**
 * Regras do Resumo (preenchimento 2023):
 *   economia líquida[m] = renda[m] − despesas[m]
 *   saldo final[jan]    = saldo inicial + economia[jan]
 *   saldo final[m]      = saldo final[m-1] + economia[m]
 *
 * Com isso, meses vazios mantêm o saldo (ex.: −R$15.000 de jan a set),
 * e o último saldo do ano é exatamente “quanto sobra”.
 */
export function summarize(budget: YearBudget): BudgetSummary {
  const incomeByMonth = sheetMonthTotals(budget.income)
  const expensesByMonth = sheetMonthTotals(budget.expenses)
  const netByMonth = incomeByMonth.map((inc, m) => inc - expensesByMonth[m])

  const balanceByMonth: number[] = []
  for (let m = 0; m < MONTHS; m++) {
    const prev = m === 0 ? budget.startingBalance : balanceByMonth[m - 1]
    balanceByMonth[m] = prev + netByMonth[m]
  }

  let lastFilledMonth = -1
  for (let m = 0; m < MONTHS; m++) {
    if (incomeByMonth[m] !== 0 || expensesByMonth[m] !== 0) lastFilledMonth = m
  }

  const months: MonthSummary[] = Array.from({ length: MONTHS }, (_, month) => ({
    month,
    income: incomeByMonth[month],
    expenses: expensesByMonth[month],
    net: netByMonth[month],
    balance: balanceByMonth[month],
  }))

  return {
    incomeByMonth,
    expensesByMonth,
    netByMonth,
    balanceByMonth,
    months,
    incomeTotal: sum(incomeByMonth),
    expensesTotal: sum(expensesByMonth),
    netTotal: sum(netByMonth),
    incomeAvg: averageFilled(incomeByMonth),
    expensesAvg: averageFilled(expensesByMonth),
    netAvg: averageFilled(netByMonth),
    lastFilledMonth,
    currentBalance: balanceByMonth[lastFilledMonth >= 0 ? lastFilledMonth : 0],
    yearEndBalance: balanceByMonth[MONTHS - 1],
  }
}

export function rowTotals(values: number[]) {
  return { total: sum(values), avg: averageFilled(values) }
}
