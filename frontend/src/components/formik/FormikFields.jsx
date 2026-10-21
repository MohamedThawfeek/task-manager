import { useField } from 'formik'
import Dropdown from '../Dropdown'
import MultiSelectDropdown from '../MultiSelectDropdown'
import DatePickerField from '../DatePickerField'

export function FormikError({ name }) {
  const [, meta] = useField(name)
  return meta.touched && meta.error
    ? <p className="error-text">{meta.error}</p>
    : null
}

export function FormikInput({ name, className = '', ...props }) {
  const [field, meta] = useField(name)
  return <input
    {...field}
    {...props}
    className={`field ${meta.touched && meta.error ? 'field-error' : ''} ${className}`}
  />
}

export function FormikTextarea({ name, className = '', ...props }) {
  const [field, meta] = useField(name)
  return <textarea
    {...field}
    {...props}
    className={`field ${meta.touched && meta.error ? 'field-error' : ''} ${className}`}
  />
}

export function FormikCheckbox({ name, className = '', ...props }) {
  const [field] = useField({ name, type: 'checkbox' })
  return <input {...field} {...props} type="checkbox" className={className} />
}

export function FormikDropdown({ name, ...props }) {
  const [field, meta, helpers] = useField(name)
  return <Dropdown
    {...props}
    value={field.value}
    onChange={helpers.setValue}
    onBlur={() => helpers.setTouched(true)}
    error={Boolean(meta.touched && meta.error)}
  />
}

export function FormikMultiSelect({ name, ...props }) {
  const [field, meta, helpers] = useField(name)
  return <MultiSelectDropdown
    {...props}
    value={field.value || []}
    onChange={helpers.setValue}
    onBlur={() => helpers.setTouched(true)}
    error={Boolean(meta.touched && meta.error)}
  />
}

export function FormikDatePicker({ name, ...props }) {
  const [field, meta, helpers] = useField(name)
  return <DatePickerField
    {...props}
    value={field.value}
    onChange={helpers.setValue}
    onBlur={() => helpers.setTouched(true)}
    error={Boolean(meta.touched && meta.error)}
  />
}
