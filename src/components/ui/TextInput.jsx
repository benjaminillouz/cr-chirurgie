export default function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-cemedis-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 rounded-lg border-2 transition-colors
          ${disabled
            ? 'border-cemedis-100 bg-cemedis-50 text-cemedis-500 cursor-not-allowed'
            : 'border-cemedis-200 focus:border-cemedis-500 focus:ring-0 text-cemedis-700 bg-white'
          }
        `}
      />
    </div>
  )
}
