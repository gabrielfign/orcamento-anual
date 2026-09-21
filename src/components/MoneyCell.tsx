import { useEffect, useRef, useState } from 'react'
import { formatMoney, parseMoney } from '../format'

interface Props {
  value: number
  onChange: (value: number) => void
  ariaLabel: string
  filledClass?: string
}

export function MoneyCell({ value, onChange, ariaLabel, filledClass = 'is-filled' }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const display = formatMoney(value, true)
  const filled = value !== 0

  if (!editing) {
    return (
      <button
        type="button"
        className={`money-cell ${filled ? filledClass : ''}`}
        aria-label={ariaLabel}
        onClick={() => {
          setDraft(value === 0 ? '' : String(value).replace('.', ','))
          setEditing(true)
        }}
      >
        {display}
      </button>
    )
  }

  function commit() {
    const parsed = parseMoney(draft)
    onChange(parsed ?? value)
    setEditing(false)
  }

  return (
    <input
      ref={inputRef}
      className={`money-cell is-editing ${filled ? filledClass : ''}`}
      aria-label={ariaLabel}
      inputMode="decimal"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
        if (e.key === 'Escape') setEditing(false)
      }}
    />
  )
}
