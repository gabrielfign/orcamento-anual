import { createYearBudget } from './seed'
import type { AppData, YearBudget } from './types'

const STORAGE_KEY = 'orcamento-anual-v2'
const CURRENT_YEAR = 2026

export function defaultData(): AppData {
  const year = createYearBudget(CURRENT_YEAR, 0)
  return {
    version: 1,
    activeYear: CURRENT_YEAR,
    years: { [CURRENT_YEAR]: year },
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as AppData
    if (parsed?.version !== 1 || !parsed.years) return defaultData()
    if (!parsed.years[parsed.activeYear]) {
      parsed.years[parsed.activeYear] = createYearBudget(parsed.activeYear, 0)
    }
    return parsed
  } catch {
    return defaultData()
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export function parseImported(raw: string): AppData {
  const parsed = JSON.parse(raw) as AppData
  if (parsed?.version !== 1 || !parsed.years || !parsed.activeYear) {
    throw new Error('Arquivo inválido')
  }
  return parsed
}

export function getYear(data: AppData): YearBudget {
  return data.years[data.activeYear] ?? createYearBudget(data.activeYear, 0)
}
