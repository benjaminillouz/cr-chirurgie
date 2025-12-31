import { FormSection, TextArea, RadioGroup, Select } from '../ui'

const OUI_NON = ['Oui', 'Non']

const RDV_CONTROLE_OPTIONS = Array.from({ length: 18 }, (_, i) => (i + 3).toString())

export default function Step6Observations({ formData, updateFormData, onGeneratePDF }) {
  return (
    <div>
      {/* Button to generate PDF at the top */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onGeneratePDF}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-cemedis-500 text-white rounded-xl font-semibold hover:bg-cemedis-600 transition-all shadow-lg shadow-cemedis-500/30"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Éditer le compte rendu
        </button>
      </div>

      <FormSection title="Observations">
        <TextArea
          label="Notes et observations"
          value={formData.observations}
          onChange={(value) => updateFormData('observations', value)}
          placeholder="Ajoutez vos observations concernant l'intervention..."
          rows={6}
        />
      </FormSection>

      <FormSection title="Suivi post-opératoire">
        <RadioGroup
          label="Fiche de conseils post opératoires remise en mains propres"
          name="fiche-conseils"
          options={OUI_NON}
          value={formData.ficheConseilsRemise}
          onChange={(value) => updateFormData('ficheConseilsRemise', value)}
          inline
        />

        <Select
          label="Rendez-vous de contrôle prévu à J+"
          value={formData.rdvControleJour}
          onChange={(value) => updateFormData('rdvControleJour', value)}
          options={RDV_CONTROLE_OPTIONS}
          placeholder="Sélectionner le nombre de jours"
        />
      </FormSection>
    </div>
  )
}
