import { StoreProvider, useStore } from './store'
import { ConfigPage } from './pages/ConfigPage'
import { ResumoPage } from './pages/ResumoPage'
import { SheetPage } from './pages/SheetPage'
import type { PageId } from './types'

const NAV: { id: PageId; label: string }[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'despesas', label: 'Despesas' },
  { id: 'renda', label: 'Renda' },
  { id: 'config', label: 'Configurar' },
]

function Shell() {
  const { page, setPage, budget } = useStore()

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden>
            $
          </span>
          <div>
            <strong>Orçamento anual</strong>
            <em>{budget.year}</em>
          </div>
        </div>
        <nav className="top-nav" aria-label="Seções">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={page === item.id ? 'is-active' : ''}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {page === 'resumo' && <ResumoPage />}
        {page === 'despesas' && <SheetPage kind="expenses" />}
        {page === 'renda' && <SheetPage kind="income" />}
        {page === 'config' && <ConfigPage />}
      </main>

      <nav className="bottom-nav" aria-label="Seções">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={page === item.id ? 'is-active' : ''}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
