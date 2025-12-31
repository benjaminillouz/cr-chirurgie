import { FormSection, CheckboxGroup, Select } from '../ui'

const PREMEDICATION_OPTIONS = [
  'Anti Inflammatoires',
  'Antalgiques',
  'Antiseptiques locaux',
  'Sédation'
]

const ANESTHESIE_OPTIONS = [
  'Locale',
  'Loco-régionale',
  'Avec vasoconstricteurs',
  'Sans vasoconstricteurs'
]

const RAPPELS_OPTIONS = [
  'Lingual',
  'Buccal',
  'Palatin'
]

const ANTISEPSIE_OPTIONS = [
  'Bain de bouche Chlorhexidine 0,12%',
  'Désinfection Péri Orale (Biseptine)'
]

const CARPULES_OPTIONS = Array.from({ length: 10 }, (_, i) => (i + 1).toString())

export default function Step2PreOperatoire({ formData, updateFormData }) {
  return (
    <div>
      <FormSection title="Prémédication">
        <CheckboxGroup
          options={PREMEDICATION_OPTIONS}
          values={formData.premedication}
          onChange={(values) => updateFormData('premedication', values)}
          columns={2}
        />
      </FormSection>

      <FormSection title="Anesthésie">
        <CheckboxGroup
          options={ANESTHESIE_OPTIONS}
          values={formData.anesthesie}
          onChange={(values) => updateFormData('anesthesie', values)}
          columns={2}
        />

        <Select
          label="Nombre de carpules"
          value={formData.nombreCarpules}
          onChange={(value) => updateFormData('nombreCarpules', value)}
          options={CARPULES_OPTIONS}
        />
      </FormSection>

      <FormSection title="Rappels anesthésiques">
        <CheckboxGroup
          options={RAPPELS_OPTIONS}
          values={formData.rappelsAnesthesiques}
          onChange={(values) => updateFormData('rappelsAnesthesiques', values)}
          columns={3}
        />
      </FormSection>

      <FormSection title="Antisepsie Locale">
        <CheckboxGroup
          options={ANTISEPSIE_OPTIONS}
          values={formData.antisepsieLocale}
          onChange={(values) => updateFormData('antisepsieLocale', values)}
        />
      </FormSection>
    </div>
  )
}
