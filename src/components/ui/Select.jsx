export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Veuillez sélectionner',
  required = false
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-cemedis-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border-2 border-cemedis-200 focus:border-cemedis-500 focus:ring-0 text-cemedis-700 bg-white transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
    </div>
  )
}
