import ImplantologieForm from './interventions/ImplantologieForm'
import ChirurgiePreImplantaireForm from './interventions/ChirurgiePreImplantaireForm'
import AvulsionsForm from './interventions/AvulsionsForm'
import FreinectomiesForm from './interventions/FreinectomiesForm'
import MiniVisForm from './interventions/MiniVisForm'

export default function Step3Intervention({ formData, updateFormData }) {
  const renderInterventionForm = () => {
    switch (formData.interventionType) {
      case 'Implantologie':
        return (
          <ImplantologieForm
            data={formData.implanto}
            updateData={(field, value) => updateFormData(`implanto.${field}`, value)}
          />
        )
      case 'Chirurgie Pré Implantaire':
        return (
          <ChirurgiePreImplantaireForm
            data={formData.chirurgiePreImplantaire}
            updateData={(field, value) => updateFormData(`chirurgiePreImplantaire.${field}`, value)}
          />
        )
      case 'Avulsions':
        return (
          <AvulsionsForm
            data={formData.avulsions}
            updateData={(field, value) => updateFormData(`avulsions.${field}`, value)}
          />
        )
      case 'Freinectomies':
        return (
          <FreinectomiesForm
            data={formData.freinectomies}
            updateData={(field, value) => updateFormData(`freinectomies.${field}`, value)}
          />
        )
      case 'Mini Vis':
        return (
          <MiniVisForm
            data={formData.miniVis}
            updateData={(field, value) => updateFormData(`miniVis.${field}`, value)}
          />
        )
      default:
        return (
          <div className="text-center py-8 text-cemedis-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-cemedis-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Veuillez sélectionner un type d'intervention à l'étape 1</p>
          </div>
        )
    }
  }

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-cemedis-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cemedis-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-cemedis-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-cemedis-800">
              {formData.interventionType || 'Intervention'}
            </h3>
            <p className="text-sm text-cemedis-500">
              Détails de l'intervention chirurgicale
            </p>
          </div>
        </div>
      </div>

      {renderInterventionForm()}
    </div>
  )
}
