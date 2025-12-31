// FDI Tooth numbering system
const TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41]
}

export default function TeethSelector({
  label,
  selectedTeeth = [],
  onChange
}) {
  const toggleTooth = (tooth) => {
    const toothStr = tooth.toString()
    const newSelection = selectedTeeth.includes(toothStr)
      ? selectedTeeth.filter(t => t !== toothStr)
      : [...selectedTeeth, toothStr]
    onChange(newSelection)
  }

  const renderToothRow = (teeth, isUpper = true) => (
    <div className="flex justify-center gap-1">
      {teeth.map((tooth) => {
        const isSelected = selectedTeeth.includes(tooth.toString())
        return (
          <button
            key={tooth}
            type="button"
            onClick={() => toggleTooth(tooth)}
            className={`
              w-9 h-9 text-xs font-medium rounded-lg transition-all
              ${isSelected
                ? 'bg-cemedis-500 text-white shadow-md'
                : 'bg-white border-2 border-cemedis-200 text-cemedis-600 hover:border-cemedis-400'
              }
            `}
          >
            {tooth}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-cemedis-700 mb-3">
          {label}
        </label>
      )}
      <div className="bg-cemedis-50 rounded-xl p-4">
        {/* Upper jaw */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-center">
            <div className="flex gap-1">
              {renderToothRow(TEETH.upperRight)}
              <div className="w-px bg-cemedis-300 mx-1" />
              {renderToothRow(TEETH.upperLeft)}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-cemedis-300" />
          <span className="text-xs text-cemedis-400 font-medium px-2">ARCADE</span>
          <div className="flex-1 h-px bg-cemedis-300" />
        </div>

        {/* Lower jaw */}
        <div className="space-y-1">
          <div className="flex justify-center">
            <div className="flex gap-1">
              {renderToothRow(TEETH.lowerRight)}
              <div className="w-px bg-cemedis-300 mx-1" />
              {renderToothRow(TEETH.lowerLeft)}
            </div>
          </div>
        </div>

        {/* Selected count */}
        {selectedTeeth.length > 0 && (
          <div className="mt-4 pt-3 border-t border-cemedis-200 text-center">
            <span className="text-sm text-cemedis-600">
              <span className="font-semibold text-cemedis-700">{selectedTeeth.length}</span> dent(s) sélectionnée(s): {' '}
              <span className="font-medium">{selectedTeeth.sort((a, b) => a - b).join(', ')}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
