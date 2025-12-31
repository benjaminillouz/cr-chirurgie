export default function FormSection({ title, children, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-cemedis-700 mb-4 pb-2 border-b border-cemedis-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
