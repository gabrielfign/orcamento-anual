import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cloneStructure, createYearBudget } from './seed'
import { getYear, loadData, saveData } from './storage'
import type { AppData, Category, PageId, SheetKind, ViewMode, YearBudget } from './types'
import { emptyValues } from './types'
import { uid } from './format'

interface StoreValue {
  data: AppData
  budget: YearBudget
  page: PageId
  viewMode: ViewMode
  selectedMonth: number
  setPage: (page: PageId) => void
  setViewMode: (mode: ViewMode) => void
  setSelectedMonth: (month: number) => void
  setStartingBalance: (value: number) => void
  setYear: (year: number) => void
  setItemValue: (kind: SheetKind, categoryId: string, itemId: string, month: number, value: number) => void
  renameItem: (kind: SheetKind, categoryId: string, itemId: string, name: string) => void
  renameCategory: (kind: SheetKind, categoryId: string, name: string) => void
  addItem: (kind: SheetKind, categoryId: string) => void
  removeItem: (kind: SheetKind, categoryId: string, itemId: string) => void
  addCategory: (kind: SheetKind) => void
  removeCategory: (kind: SheetKind, categoryId: string) => void
  replaceData: (next: AppData) => void
  resetYear: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function updateYear(data: AppData, recipe: (year: YearBudget) => YearBudget): AppData {
  const current = getYear(data)
  const nextYear = recipe(current)
  return {
    ...data,
    years: { ...data.years, [data.activeYear]: nextYear },
  }
}

function cats(year: YearBudget, kind: SheetKind): Category[] {
  return kind === 'expenses' ? year.expenses : year.income
}

function withCats(year: YearBudget, kind: SheetKind, next: Category[]): YearBudget {
  return kind === 'expenses' ? { ...year, expenses: next } : { ...year, income: next }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())
  const [page, setPage] = useState<PageId>('resumo')
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 900 ? 'mes' : 'ano',
  )
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth())

  const persist = useCallback((next: AppData) => {
    setData(next)
    saveData(next)
  }, [])

  const budget = useMemo(() => getYear(data), [data])

  const value = useMemo<StoreValue>(
    () => ({
      data,
      budget,
      page,
      viewMode,
      selectedMonth,
      setPage,
      setViewMode,
      setSelectedMonth,
      setStartingBalance: (startingBalance) => {
        persist(updateYear(data, (y) => ({ ...y, startingBalance })))
      },
      setYear: (year) => {
        const key = String(year)
        if (data.years[key]) {
          persist({ ...data, activeYear: year })
          return
        }
        const source = getYear(data)
        persist({
          ...data,
          activeYear: year,
          years: { ...data.years, [key]: cloneStructure(source, year) },
        })
      },
      setItemValue: (kind, categoryId, itemId, month, value) => {
        persist(
          updateYear(data, (y) => {
            const next = cats(y, kind).map((c) => {
              if (c.id !== categoryId) return c
              return {
                ...c,
                items: c.items.map((it) =>
                  it.id === itemId
                    ? {
                        ...it,
                        values: it.values.map((v, i) => (i === month ? value : v)),
                      }
                    : it,
                ),
              }
            })
            return withCats(y, kind, next)
          }),
        )
      },
      renameItem: (kind, categoryId, itemId, name) => {
        persist(
          updateYear(data, (y) =>
            withCats(
              y,
              kind,
              cats(y, kind).map((c) =>
                c.id !== categoryId
                  ? c
                  : { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, name } : it)) },
              ),
            ),
          ),
        )
      },
      renameCategory: (kind, categoryId, name) => {
        persist(
          updateYear(data, (y) =>
            withCats(
              y,
              kind,
              cats(y, kind).map((c) => (c.id === categoryId ? { ...c, name } : c)),
            ),
          ),
        )
      },
      addItem: (kind, categoryId) => {
        persist(
          updateYear(data, (y) =>
            withCats(
              y,
              kind,
              cats(y, kind).map((c) =>
                c.id !== categoryId
                  ? c
                  : {
                      ...c,
                      items: [
                        ...c.items,
                        { id: uid(`${categoryId}-item`), name: 'Novo item', values: emptyValues() },
                      ],
                    },
              ),
            ),
          ),
        )
      },
      removeItem: (kind, categoryId, itemId) => {
        persist(
          updateYear(data, (y) =>
            withCats(
              y,
              kind,
              cats(y, kind).map((c) =>
                c.id !== categoryId ? c : { ...c, items: c.items.filter((it) => it.id !== itemId) },
              ),
            ),
          ),
        )
      },
      addCategory: (kind) => {
        persist(
          updateYear(data, (y) =>
            withCats(y, kind, [
              ...cats(y, kind),
              {
                id: uid(kind === 'expenses' ? 'exp' : 'inc'),
                name: 'Nova categoria',
                items: [{ id: uid('item'), name: 'Novo item', values: emptyValues() }],
              },
            ]),
          ),
        )
      },
      removeCategory: (kind, categoryId) => {
        persist(
          updateYear(data, (y) =>
            withCats(
              y,
              kind,
              cats(y, kind).filter((c) => c.id !== categoryId),
            ),
          ),
        )
      },
      replaceData: persist,
      resetYear: () => {
        persist(
          updateYear(data, (y) => createYearBudget(y.year, y.startingBalance)),
        )
      },
    }),
    [data, budget, page, viewMode, selectedMonth, persist],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore fora do provider')
  return ctx
}
