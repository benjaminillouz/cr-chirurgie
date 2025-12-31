import { useState, useCallback } from 'react'
import FormHeader from './components/FormHeader'
import StepIndicator from './components/StepIndicator'
import FormNavigation from './components/FormNavigation'
import Step1GeneralInfo from './components/steps/Step1GeneralInfo'
import Step2PreOperatoire from './components/steps/Step2PreOperatoire'
import Step3Intervention from './components/steps/Step3Intervention'
import Step4Tracabilite from './components/steps/Step4Tracabilite'
import Step5Imagerie from './components/steps/Step5Imagerie'
import Step6Observations from './components/steps/Step6Observations'
import MobilePhotoCapture from './components/MobilePhotoCapture'
import MobilePDFReceiver from './components/MobilePDFReceiver'
import PDFGenerator from './components/PDFGenerator'

// Check if we're in photo capture mode
function isPhotoMode() {
  const params = new URLSearchParams(window.location.search)
  return params.get('photo') === '1' && params.get('peer')
}

function getPhotoModePeerId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('peer')
}

// Check if we're in PDF receive mode
function isPDFMode() {
  const params = new URLSearchParams(window.location.search)
  return params.get('pdf') === '1' && params.get('peer')
}

function getPDFModePeerId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('peer')
}

// Parse URL parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    patientName: params.get('patientName') || '',
    patientSurname: params.get('patientSurname') || '',
    idPraticien: params.get('idPraticien') || '',
    idCentre: params.get('idCentre') || '',
    idPatient: params.get('idPatient') || '',
    centre: params.get('centre')?.replace(/\+/g, ' ').replace(/^\s*-\s*-\s*/, '').trim() || '',
    patientMail: params.get('patientMail') || '',
    praticien: params.get('praticien')?.replace(/\+/g, ' ') || ''
  }
}

// Get today's date and time
function getCurrentDateTime() {
  const now = new Date()
  return {
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5)
  }
}

// Initial form state
const getInitialFormData = (urlParams) => {
  const dateTime = getCurrentDateTime()
  return {
    // From URL parameters
    patientName: urlParams.patientName,
    patientSurname: urlParams.patientSurname,
    idPraticien: urlParams.idPraticien,
    idCentre: urlParams.idCentre,
    idPatient: urlParams.idPatient,
    centre: urlParams.centre,
    patientMail: urlParams.patientMail,
    praticien: urlParams.praticien,

    // General info
    interventionDate: dateTime.date,
    interventionTime: dateTime.time,
    interventionType: '',

    // Pre-operatoire
    premedication: [],
    anesthesie: [],
    nombreCarpules: '',
    rappelsAnesthesiques: [],
    antisepsieLocale: [],

    // Implantologie specific
    implanto: {
      indication: '',
      dentsImplants: [],
      incision: '',
      incisionDecharge: '',
      sequenceForage: '',
      sequenceOsteotome: '',
      hauteurOsResiduel: '',
      poseCle: '',
      vis: '',
      sutures: '',
      fil: '',
      typeFil: '',
      hemostase: ''
    },

    // Chirurgie Pré Implantaire specific
    chirurgiePreImplantaire: {
      indication: '',
      incision: '',
      incisionDecharge: '',
      avulsionSeparation: false,
      dentsExtraites: [],
      revisionPlaie: false,
      nettoyageCHX: false,
      biomateriaux: [],
      sutures: '',
      fil: '',
      typeFil: '',
      hemostase: ''
    },

    // Avulsions specific
    avulsions: {
      indication: '',
      dents: [],
      lambeau: '',
      typeIncision: '',
      incisionDecharge: '',
      alveolectomie: '',
      localisation: [],
      separationRacines: '',
      revisionPlaie: false,
      rincageCHX: false,
      sutures: '',
      fil: '',
      typeFil: '',
      hemostase: ''
    },

    // Mini Vis specific
    miniVis: {
      indication: '',
      preForage: '',
      dents: [],
      poseMiniVis: [],
      localisation: '',
      rdvControle: false
    },

    // Freinectomies specific
    freinectomies: {
      type: [],
      incision: false,
      desinsertionFibres: false,
      suturesCheck: false,
      sutures: '',
      fil: '',
      typeFil: '',
      hemostase: ''
    },

    // Tracabilité
    tracabilitePhotos: [],

    // Imagerie
    radiographies: [],

    // Observations
    observations: '',
    ficheConseilsRemise: '',
    rdvControleJour: ''
  }
}

function App() {
  // Check if we're in mobile photo capture mode
  if (isPhotoMode()) {
    return <MobilePhotoCapture peerId={getPhotoModePeerId()} />
  }

  // Check if we're in PDF receive mode (from QR scan)
  if (isPDFMode()) {
    return <MobilePDFReceiver peerId={getPDFModePeerId()} />
  }

  const [urlParams] = useState(getUrlParams)
  const [formData, setFormData] = useState(() => getInitialFormData(urlParams))
  const [currentStep, setCurrentStep] = useState(1)
  const [showPDFGenerator, setShowPDFGenerator] = useState(false)

  // Define steps based on intervention type
  const getSteps = useCallback(() => {
    const baseSteps = [
      { id: 1, name: 'Informations', shortName: 'Info' },
      { id: 2, name: 'Pré-opératoire', shortName: 'Pré-op' },
      { id: 3, name: 'Intervention', shortName: 'Interv.' },
    ]

    // Add traceability step for Implantologie and Chirurgie Pré Implantaire
    const needsTracabilite = ['Implantologie', 'Chirurgie Pré Implantaire'].includes(formData.interventionType)
    if (needsTracabilite) {
      baseSteps.push({ id: 4, name: 'Traçabilité', shortName: 'Traça.' })
    }

    baseSteps.push(
      { id: baseSteps.length + 1, name: 'Imagerie', shortName: 'Image.' },
      { id: baseSteps.length + 2, name: 'Observations', shortName: 'Obs.' }
    )

    return baseSteps.map((step, index) => ({ ...step, id: index + 1 }))
  }, [formData.interventionType])

  const steps = getSteps()
  const totalSteps = steps.length

  // Update form data - supports both direct values and functional updates
  const updateFormData = useCallback((field, valueOrUpdater) => {
    setFormData(prev => {
      // Get current value for this field
      let currentValue
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        currentValue = prev[parent]?.[child]
      } else {
        currentValue = prev[field]
      }

      // Support functional updates for arrays (to avoid stale closure issues)
      const value = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(currentValue)
        : valueOrUpdater

      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }
      }
      return { ...prev, [field]: value }
    })
  }, [])

  // Navigation
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep, totalSteps])

  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [totalSteps])

  // Open PDF Generator
  const handleGeneratePDF = useCallback(() => {
    setShowPDFGenerator(true)
  }, [])

  // Render current step content
  const renderStepContent = () => {
    const hasTracabilite = ['Implantologie', 'Chirurgie Pré Implantaire'].includes(formData.interventionType)

    if (currentStep === 1) {
      return (
        <Step1GeneralInfo
          formData={formData}
          updateFormData={updateFormData}
        />
      )
    }

    if (currentStep === 2) {
      return (
        <Step2PreOperatoire
          formData={formData}
          updateFormData={updateFormData}
        />
      )
    }

    if (currentStep === 3) {
      return (
        <Step3Intervention
          formData={formData}
          updateFormData={updateFormData}
        />
      )
    }

    if (hasTracabilite && currentStep === 4) {
      return (
        <Step4Tracabilite
          formData={formData}
          updateFormData={updateFormData}
        />
      )
    }

    const imagerieStep = hasTracabilite ? 5 : 4
    const observationsStep = hasTracabilite ? 6 : 5

    if (currentStep === imagerieStep) {
      return (
        <Step5Imagerie
          formData={formData}
          updateFormData={updateFormData}
        />
      )
    }

    if (currentStep === observationsStep) {
      return (
        <Step6Observations
          formData={formData}
          updateFormData={updateFormData}
          onGeneratePDF={handleGeneratePDF}
        />
      )
    }

    return null
  }

  return (
    <>
    {showPDFGenerator && (
      <PDFGenerator
        formData={formData}
        onClose={() => setShowPDFGenerator(false)}
      />
    )}

    <div className="min-h-screen bg-gradient-to-br from-cemedis-50 to-cemedis-100">
      <FormHeader />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
        />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Patient info bar */}
          <div className="bg-cemedis-500 text-white px-6 py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">
                  {formData.patientName} {formData.patientSurname}
                </span>
              </div>
              {formData.praticien && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formData.praticien}</span>
                </div>
              )}
              {formData.centre && (
                <div className="flex items-center gap-2 ml-auto">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate max-w-xs">{formData.centre}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="animate-fade-in" key={currentStep}>
              {renderStepContent()}
            </div>
          </div>

          <FormNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrev={goToPrevStep}
            onNext={goToNextStep}
            canProceed={currentStep === 1 ? !!formData.interventionType : true}
          />
        </div>
      </main>
    </div>
    </>
  )
}

export default App
