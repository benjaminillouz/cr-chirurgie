export default function FormHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-cemedis-100">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cemedis-500 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-cemedis-800">
              Compte Rendu Opératoire
            </h1>
            <p className="text-sm text-cemedis-500">
              Chirurgie Orale et Implantologie
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
