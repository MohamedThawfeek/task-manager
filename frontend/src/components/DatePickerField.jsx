import { forwardRef, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import DatePicker from 'react-datepicker'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function CalendarSelect({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  return <div ref={rootRef} className="datepicker-select relative">
    <button
      type="button"
      aria-label={ariaLabel}
      aria-haspopup="listbox"
      aria-expanded={open}
      className="datepicker-select-trigger"
      onClick={() => setOpen((current) => !current)}
    >
      <span>{selected?.label}</span>
      <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
    </button>
    {open && <div role="listbox" className="datepicker-select-menu scrollbar-thin">
      {options.map((option) => (
        <button
          type="button"
          role="option"
          aria-selected={option.value === value}
          key={option.value}
          className={option.value === value ? 'active' : ''}
          onClick={() => {
            onChange(option.value)
            setOpen(false)
          }}
        >
          {option.label}
        </button>
      ))}
    </div>}
  </div>
}

function CalendarHeader({
  date,
  changeMonth,
  changeYear,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) {
  const currentYear = date.getFullYear()
  const yearOptions = Array.from({ length: 31 }, (_, index) => {
    const year = currentYear - 10 + index
    return { value: year, label: String(year) }
  })
  const monthOptions = months.map((month, index) => ({ value: index, label: month }))

  return <div className="datepicker-custom-header">
    <div className="datepicker-header-title">
      <button type="button" disabled={prevMonthButtonDisabled} onClick={decreaseMonth} aria-label="Previous month">
        <ChevronLeft size={19} />
      </button>
      <strong>{months[date.getMonth()]} {currentYear}</strong>
      <button type="button" disabled={nextMonthButtonDisabled} onClick={increaseMonth} aria-label="Next month">
        <ChevronRight size={19} />
      </button>
    </div>
    <div className="datepicker-header-selects">
      <CalendarSelect
        ariaLabel="Select month"
        value={date.getMonth()}
        options={monthOptions}
        onChange={changeMonth}
      />
      <CalendarSelect
        ariaLabel="Select year"
        value={currentYear}
        options={yearOptions}
        onChange={changeYear}
      />
    </div>
  </div>
}

const DateInput = forwardRef(function DateInput({ error, ...inputProps }, ref) {
  return <div className="date-picker-input relative">
    <input
      {...inputProps}
      ref={ref}
      type="text"
      autoComplete="off"
      className={`field pr-11 ${error ? 'field-error' : ''}`}
    />
    <CalendarDays
      aria-hidden="true"
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74819b]"
      size={18}
    />
  </div>
})

function parseDate(value) {
  if (!value) return null
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.toDate() : null
}

export default function DatePickerField({
  value,
  onChange,
  onBlur,
  error = false,
  placeholder = 'MM/DD/YYYY',
  ariaLabel = 'Select date',
  minDate,
  maxDate,
  disabled = false,
}) {
  return <DatePicker
    selected={parseDate(value)}
    onChange={(date) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')}
    onBlur={onBlur}
    dateFormat="MM/dd/yyyy"
    placeholderText={placeholder}
    aria-label={ariaLabel}
    minDate={minDate}
    maxDate={maxDate}
    disabled={disabled}
    renderCustomHeader={(headerProps) => <CalendarHeader {...headerProps} />}
    calendarStartDay={1}
    strictParsing
    showPopperArrow={false}
    popperPlacement="bottom-start"
    portalId="taskflow-datepicker-root"
    customInput={<DateInput error={error} />}
  />
}
