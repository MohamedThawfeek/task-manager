import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import SearchInput from './SearchInput'

const initials = (label = '') => label.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

export default function MultiSelectDropdown({
  value = [],
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select users',
  error = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const listId = useId()
  const selectedValues = Array.isArray(value) ? value : []
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value))
  const filteredOptions = useMemo(() => options.filter((option) => (
    `${option.label} ${option.subtitle || ''}`.toLowerCase().includes(query.toLowerCase())
  )), [options, query])

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const toggle = (optionValue) => {
    onChange(selectedValues.includes(optionValue)
      ? selectedValues.filter((item) => item !== optionValue)
      : [...selectedValues, optionValue])
  }

  return <div ref={rootRef} className="relative">
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      onClick={() => setOpen((current) => !current)}
      onBlur={() => !open && onBlur?.()}
      className={`field flex min-h-[50px] items-center justify-between gap-3 text-left ${open ? 'border-primary ring-2 ring-primary/10' : ''} ${error ? 'field-error' : ''}`}
    >
      <span className={selectedOptions.length ? 'font-medium' : 'text-[#8290ad]'}>{selectedOptions.length ? `${selectedOptions.length} user${selectedOptions.length === 1 ? '' : 's'} selected` : placeholder}</span>
      <ChevronDown size={16} className={`shrink-0 text-[#73809a] transition-transform ${open ? 'rotate-180 text-primary' : ''}`} />
    </button>
    {open && <div id={listId} role="listbox" aria-multiselectable="true" className="dropdown-menu absolute z-[90] mt-2 w-full rounded-[10px] border border-[#dfe4ef] bg-white p-2 shadow-[0_14px_35px_rgba(21,31,59,.18)]">
      <SearchInput autoFocus value={query} onValueChange={setQuery} className="mb-2" inputClassName="min-h-[40px] py-2 text-sm" placeholder="Search users" />
      <div className="mb-1 flex items-center justify-between px-2 py-1 text-xs"><span className="text-muted">{selectedValues.length} selected</span><button type="button" className="font-semibold text-primary" onClick={() => onChange(selectedValues.length === options.length ? [] : options.map((option) => option.value))}>{selectedValues.length === options.length ? 'Clear all' : 'Select all'}</button></div>
      <div className="scrollbar-thin max-h-[190px] overflow-y-auto overscroll-contain">{filteredOptions.map((option) => {
        const active = selectedValues.includes(option.value)
        return <button type="button" role="option" aria-selected={active} key={option.value} onClick={() => toggle(option.value)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${active ? 'bg-[#f0eeff]' : 'hover:bg-[#f5f6fa]'}`}>
          <span className="avatar h-8 w-8 text-[10px]">{option.avatar || initials(option.label)}</span>
          <span className="min-w-0 flex-1"><strong className={`block truncate text-sm ${active ? 'text-primary' : ''}`}>{option.label}</strong>{option.subtitle && <span className="block truncate text-xs text-muted">{option.subtitle}</span>}</span>
          <span className={`grid h-5 w-5 place-items-center rounded border ${active ? 'border-primary bg-primary text-white' : 'border-[#cfd6e4]'}`}>{active && <Check size={14} />}</span>
        </button>
      })}</div>
      {!filteredOptions.length && <p className="px-3 py-5 text-center text-sm text-muted">No users found</p>}
    </div>}
    {selectedOptions.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{selectedOptions.map((option) => <span key={option.value} className="inline-flex items-center gap-2 rounded-full bg-[#eeecff] py-1 pl-1 pr-2 text-xs font-semibold text-primary"><span className="avatar h-6 w-6 text-[9px]">{option.avatar || initials(option.label)}</span>{option.label}<button type="button" aria-label={`Remove ${option.label}`} onClick={() => toggle(option.value)} className="rounded-full p-0.5 hover:bg-white/70"><X size={12} /></button></span>)}</div>}
  </div>
}
