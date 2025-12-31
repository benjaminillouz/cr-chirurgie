export default function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  inline = false
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-cemedis-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`flex ${inline ? 'flex-wrap gap-3' : 'flex-col gap-2'}`}>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label

          return (
            <label
              key={optionValue}
              className={`
                flex items-center gap-3 cursor-pointer group
                ${inline ? 'px-4 py-2.5 rounded-lg border-2 transition-all' : 'py-1'}
                ${inline && value === optionValue
                  ? 'border-cemedis-500 bg-cemedis-50'
                  : inline
                    ? 'border-cemedis-200 hover:border-cemedis-300'
                    : ''
                }
              `}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={value === optionValue}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 text-cemedis-500 border-cemedis-300 focus:ring-cemedis-500 focus:ring-offset-0"
              />
              <span className={`text-sm ${value === optionValue ? 'text-cemedis-700 font-medium' : 'text-cemedis-600'}`}>
                {optionLabel}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
