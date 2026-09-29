import './FilterSelect.css'

// Reusable labelled dropdown filter.
// options: Array<{ value: string, label: string }>
export default function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <label className="filter-select" htmlFor={id}>
      <span className="filter-select__label">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
