import { useCallback } from 'react'

export default function FileUpload({
  label,
  files = [],
  onChange,
  accept = 'image/*',
  multiple = true,
  maxFiles = 5
}) {
  const handleFileChange = useCallback((e) => {
    const newFiles = Array.from(e.target.files)
    const remainingSlots = maxFiles - files.length
    const filesToAdd = newFiles.slice(0, remainingSlots)

    if (filesToAdd.length > 0) {
      const fileObjects = filesToAdd.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
      onChange([...files, ...fileObjects])
    }
  }, [files, maxFiles, onChange])

  const removeFile = useCallback((id) => {
    const fileToRemove = files.find(f => f.id === id)
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    onChange(files.filter(f => f.id !== id))
  }, [files, onChange])

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-cemedis-700 mb-2">
          {label}
        </label>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {files.map((fileObj) => (
            <div
              key={fileObj.id}
              className="relative group rounded-lg overflow-hidden border-2 border-cemedis-200 bg-cemedis-50"
            >
              {fileObj.file?.type?.startsWith('image/') ? (
                <img
                  src={fileObj.preview}
                  alt={fileObj.name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center">
                  <svg className="w-12 h-12 text-cemedis-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(fileObj.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                {fileObj.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {files.length < maxFiles && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-cemedis-300 rounded-lg cursor-pointer hover:border-cemedis-500 hover:bg-cemedis-50 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-3 text-cemedis-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-1 text-sm text-cemedis-600">
              <span className="font-semibold">Cliquez pour ajouter</span> ou glissez-déposez
            </p>
            <p className="text-xs text-cemedis-400">
              {files.length}/{maxFiles} fichiers
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  )
}
