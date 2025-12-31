import { FormSection, TextInput, RadioGroup } from '../ui'

const INTERVENTION_TYPES = [
  'Implantologie',
  'Chirurgie Pré Implantaire',
  'Avulsions',
  'Freinectomies',
  'Mini Vis'
]

export default function Step1GeneralInfo({ formData, updateFormData }) {
  return (
    <div>
      <FormSection title="Date de l'intervention">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Date"
            type="date"
            value={formData.interventionDate}
            onChange={(value) => updateFormData('interventionDate', value)}
            required
          />
          <TextInput
            label="Heure"
            type="time"
            value={formData.interventionTime}
            onChange={(value) => updateFormData('interventionTime', value)}
            required
          />
        </div>
      </FormSection>

      <FormSection title="Intervention réalisée par">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Docteur"
            value={formData.praticien}
            onChange={(value) => updateFormData('praticien', value)}
            disabled
          />
          <TextInput
            label="Établissement"
            value={formData.centre}
            onChange={(value) => updateFormData('centre', value)}
            disabled
          />
        </div>
      </FormSection>

      <FormSection title="Patient">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Nom"
            value={formData.patientName}
            onChange={(value) => updateFormData('patientName', value)}
            disabled
          />
          <TextInput
            label="Prénom"
            value={formData.patientSurname}
            onChange={(value) => updateFormData('patientSurname', value)}
            disabled
          />
        </div>
      </FormSection>

      <FormSection title="Type d'intervention">
        <RadioGroup
          name="interventionType"
          options={INTERVENTION_TYPES}
          value={formData.interventionType}
          onChange={(value) => updateFormData('interventionType', value)}
          required
        />
        {!formData.interventionType && (
          <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Veuillez sélectionner un type d'intervention pour continuer
          </p>
        )}
      </FormSection>
    </div>
  )
}
