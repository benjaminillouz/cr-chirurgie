import { FormSection, TextArea, RadioGroup, Select } from '../ui'

const OUI_NON = ['Oui', 'Non']

const RDV_CONTROLE_OPTIONS = Array.from({ length: 18 }, (_, i) => (i + 3).toString())

export default function Step6Observations({ formData, updateFormData }) {
  return (
    <div>
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

      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-green-800">Prêt à valider</h4>
            <p className="text-sm text-green-700 mt-1">
              Vérifiez les informations saisies puis cliquez sur "Éditer le compte rendu" pour finaliser.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
