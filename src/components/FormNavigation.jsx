export default function FormNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  canProceed = true
}) {
  const isLastStep = currentStep === totalSteps
  const isFirstStep = currentStep === 1

  return (
    <div className="border-t border-cemedis-100 px-6 py-4 bg-cemedis-50/50">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirstStep}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all
            ${isFirstStep
              ? 'text-cemedis-300 cursor-not-allowed'
              : 'text-cemedis-600 hover:text-cemedis-800 hover:bg-cemedis-100'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        {!isLastStep && (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all
              ${!canProceed
                ? 'bg-cemedis-300 text-white cursor-not-allowed'
                : 'bg-cemedis-500 text-white hover:bg-cemedis-600 shadow-lg shadow-cemedis-500/30'
              }
            `}
          >
            Suivant
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {isLastStep && (
          <div className="text-sm text-cemedis-500 italic">
            Utilisez le bouton ci-dessus pour générer le PDF
          </div>
        )}
      </div>
    </div>
  )
}
