export const MONTHS = 12

export const MONTH_LABELS = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
] as const

export type PageId = 'resumo' | 'despesas' | 'renda' | 'config'
export type SheetKind = 'expenses' | 'income'
export type ViewMode = 'mes' | 'ano'

export interface LineItem {
  id: string
  name: string
  values: number[]
}

export interface Category {
  id: string
  name: string
  items: LineItem[]
}

export interface YearBudget {
  year: number
  startingBalance: number
  expenses: Category[]
  income: Category[]
}

export interface AppData {
  version: 1
  activeYear: number
  years: Record<string, YearBudget>
}

export function emptyValues(): number[] {
  return Array.from({ length: MONTHS }, () => 0)
}
