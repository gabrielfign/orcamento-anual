const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const currencyCents = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(value: number, emptyIfZero = false): string {
  if (!Number.isFinite(value)) return ''
  if (emptyIfZero && value === 0) return ''
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? currency.format(rounded) : currencyCents.format(rounded)
}

export function formatMoneySigned(value: number): string {
  if (!Number.isFinite(value)) return ''
  const formatted = formatMoney(Math.abs(value))
  if (value < 0) return `-${formatted}`
  return formatted
}

/** Interpreta digitação brasileira: 1.234,56 | 1234,56 | 1234.56 | -15000 */
export function parseMoney(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '').replace(/^R\$\s?/i, '')
  if (s === '' || s === '-') return 0
  const negative = s.startsWith('-')
  const digits = negative ? s.slice(1) : s
  if (!digits) return 0

  let normalized: string
  const hasComma = digits.includes(',')
  const hasDot = digits.includes('.')
  if (hasComma && hasDot) {
    normalized = digits.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    normalized = digits.replace(',', '.')
  } else if (hasDot) {
    const parts = digits.split('.')
    if (parts.length > 2 || (parts[1] && parts[1].length === 3 && parts[0].length <= 3)) {
      normalized = digits.replace(/\./g, '')
    } else {
      normalized = digits
    }
  } else {
    normalized = digits
  }

  const n = Number(normalized)
  if (!Number.isFinite(n)) return null
  return negative ? -n : n
}

export function monthHeader(monthIndex: number, year: number): string {
  const labels = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']
  return `${labels[monthIndex]} '${String(year).slice(2)}`
}

export function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
