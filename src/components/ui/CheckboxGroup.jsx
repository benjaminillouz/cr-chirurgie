export default function CheckboxGroup({
  label,
  options,
  values = [],
  onChange,
  columns = 1
}) {
  const handleToggle = (optionValue) => {
    const newValues = values.includes(optionValue)
      ? values.filter((v) => v !== optionValue)
      : [...values, optionValue]
    onChange(newValues)
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    8: 'grid-cols-4 sm:grid-cols-8'
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-cemedis-700 mb-2">
          {label}
        </label>
      )}
      <div className={`grid ${gridCols[columns] || 'grid-cols-1'} gap-2`}>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          const isChecked = values.includes(optionValue)

          return (
            <label
              key={optionValue}
              className={`
                flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg border-2 transition-all
                ${isChecked
                  ? 'border-cemedis-500 bg-cemedis-50'
                  : 'border-cemedis-200 hover:border-cemedis-300'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(optionValue)}
                className="w-4 h-4 text-cemedis-500 border-cemedis-300 rounded focus:ring-cemedis-500 focus:ring-offset-0"
              />
              <span className={`text-sm ${isChecked ? 'text-cemedis-700 font-medium' : 'text-cemedis-600'}`}>
                {optionLabel}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
