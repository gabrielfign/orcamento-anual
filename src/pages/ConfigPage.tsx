import { useRef } from 'react'
import { useStore } from '../store'
import { formatMoney, parseMoney } from '../format'
import { exportJson, parseImported } from '../storage'

export function ConfigPage() {
  const { budget, data, setStartingBalance, setYear, replaceData, resetYear } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="page">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Configurar</p>
          <h1>Controle de orçamento anual</h1>
          <p className="lede">Planeje e controle seus gastos mensais durante o ano inteiro.</p>
        </div>
      </div>

      <section className="config-card">
        <h2>Como usar</h2>
        <ol className="steps">
          <li>
            Digite o <strong>saldo inicial</strong> — pode ser negativo se você começa o ano no vermelho.
          </li>
          <li>
            Preencha as abas <strong>Despesas</strong> e <strong>Renda</strong>.
          </li>
          <li>
            Renomeie ou exclua categorias se quiser. O <strong>Resumo</strong> recalcula sozinho e mostra quanto sobra.
          </li>
        </ol>
      </section>

      <section className="config-grid">
        <label className="field">
          <span>Ano</span>
          <input
            type="number"
            min={2000}
            max={2100}
            defaultValue={budget.year}
            key={budget.year}
            onBlur={(e) => {
              const year = Number(e.target.value)
              if (year >= 2000 && year <= 2100 && year !== budget.year) setYear(year)
            }}
          />
        </label>
        <label className="field">
          <span>Saldo inicial</span>
          <input
            inputMode="decimal"
            defaultValue={budget.startingBalance === 0 ? '' : String(budget.startingBalance)}
            key={budget.year + ':' + budget.startingBalance}
            placeholder="0"
            onBlur={(e) => {
              const parsed = parseMoney(e.target.value)
              setStartingBalance(parsed ?? 0)
            }}
          />
          <small>Atual: {formatMoney(budget.startingBalance) || 'R$ 0'}</small>
        </label>
      </section>

      <section className="config-card">
        <h2>Seus dados ficam neste aparelho</h2>
        <p>
          Nada vai para a nuvem. Exporte um backup de vez em quando — se limpar o navegador, os lançamentos somem.
        </p>
        <div className="btn-row">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              const blob = new Blob([exportJson(data)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `orcamento-${budget.year}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Exportar backup
          </button>
          <button type="button" className="ghost-btn" onClick={() => fileRef.current?.click()}>
            Importar backup
          </button>
          <button
            type="button"
            className="ghost-btn danger"
            onClick={() => {
              if (confirm(`Zerar todos os valores de ${budget.year}? Categorias voltam ao modelo.`)) resetYear()
            }}
          >
            Zerar {budget.year}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              file.text().then((text) => {
                try {
                  replaceData(parseImported(text))
                } catch {
                  alert('Não consegui ler esse arquivo.')
                }
              })
            }}
          />
        </div>
      </section>
    </div>
  )
}
