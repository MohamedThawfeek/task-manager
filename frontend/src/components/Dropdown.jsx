import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

const normalizeOptions = (options) => options.map((option) => (
  typeof option === 'string' ? { label: option, value: option } : option
))

export default function Dropdown({
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  className = '',
  error = false,
  ariaLabel,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const items = normalizeOptions(options)
  const selected = items.find((item) => item.value === value)

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const closeMenu = () => {
    setOpen(false)
    onBlur?.()
  }

  return <div ref={rootRef} className={`relative ${className}`}>
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel || placeholder}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') closeMenu()
        if ((event.key === 'Enter' || event.key === ' ') && !open) setOpen(true)
      }}
      className={`field flex min-h-[44px] items-center justify-between gap-3 text-left transition ${open ? 'border-primary ring-2 ring-primary/10' : ''} ${error ? 'field-error' : ''}`}
    >
      <span className={selected ? '' : 'text-[#8290ad]'}>{selected?.label || placeholder}</span>
      <ChevronDown size={16} className={`shrink-0 text-[#73809a] transition-transform ${open ? 'rotate-180 text-primary' : ''}`} />
    </button>
    {open && <div id={listId} role="listbox" className="dropdown-menu scrollbar-thin absolute z-[80] mt-2 max-h-52 w-full overflow-y-auto rounded-[10px] border border-[#dfe4ef] bg-white p-1.5 shadow-[0_14px_35px_rgba(21,31,59,.16)]">
      {items.map((item) => {
        const active = item.value === value
        return <button
          type="button"
          role="option"
          aria-selected={active}
          key={item.value}
          onClick={() => { onChange(item.value); closeMenu() }}
          className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm transition ${active ? 'bg-[#f0eeff] font-semibold text-primary' : 'hover:bg-[#f5f6fa]'}`}
        >
          <span>{item.label}</span>{active && <Check size={16} />}
        </button>
      })}
    </div>}
  </div>
}
