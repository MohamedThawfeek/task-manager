import { Search, X } from 'lucide-react'

export default function SearchInput({
  value,
  onValueChange,
  placeholder = 'Search',
  ariaLabel,
  className = '',
  inputClassName = '',
  autoFocus = false,
  onFocus,
}) {
  return <div className={`search-control relative ${className}`}>
    <Search
      aria-hidden="true"
      className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#8d9ab4]"
      size={16}
    />
    <input
      type="search"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      onFocus={onFocus}
      autoFocus={autoFocus}
      aria-label={ariaLabel || placeholder}
      className={`field search-field min-h-[44px] ${inputClassName}`}
      placeholder={placeholder}
    />
    {value && <button
      type="button"
      aria-label="Clear search"
      onClick={() => onValueChange('')}
      className="search-clear absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-[#8995aa] transition hover:bg-[#eef1f7] hover:text-[#4f5d78]"
    >
      <X size={14} />
    </button>}
  </div>
}
