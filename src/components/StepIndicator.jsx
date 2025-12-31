export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="mb-6">
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => onStepClick(step.id)}
              className={`
                flex items-center gap-3 transition-all
                ${step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              `}
              disabled={step.id > currentStep}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${step.id === currentStep
                    ? 'bg-cemedis-500 text-white shadow-lg shadow-cemedis-500/30'
                    : step.id < currentStep
                      ? 'bg-cemedis-500 text-white'
                      : 'bg-white text-cemedis-400 border-2 border-cemedis-200'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`
                  text-sm font-medium whitespace-nowrap
                  ${step.id === currentStep ? 'text-cemedis-700' : 'text-cemedis-400'}
                `}
              >
                {step.name}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-4 transition-colors
                  ${step.id < currentStep ? 'bg-cemedis-500' : 'bg-cemedis-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-cemedis-600">
            Étape {currentStep} sur {steps.length}
          </span>
          <span className="text-sm font-semibold text-cemedis-800">
            {steps.find(s => s.id === currentStep)?.name}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => step.id <= currentStep && onStepClick(step.id)}
              className={`
                flex-1 h-2 rounded-full transition-all
                ${step.id === currentStep
                  ? 'bg-cemedis-500'
                  : step.id < currentStep
                    ? 'bg-cemedis-400'
                    : 'bg-cemedis-200'
                }
                ${step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              disabled={step.id > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
