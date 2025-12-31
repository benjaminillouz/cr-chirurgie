export default function TextArea({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-cemedis-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-lg border-2 border-cemedis-200 focus:border-cemedis-500 focus:ring-0 text-cemedis-700 bg-white transition-colors resize-none"
      />
    </div>
  )
}
