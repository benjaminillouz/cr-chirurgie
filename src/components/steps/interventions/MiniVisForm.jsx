import { FormSection, RadioGroup, CheckboxGroup, TeethSelector } from '../../ui'

const INDICATION_OPTIONS = [
  'Orthodontiques',
  'Prothétiques'
]

const OUI_NON = ['Oui', 'Non']

const POSE_MINIVIS_OPTIONS = [
  'Tournevis',
  'Contre Angle'
]

const LOCALISATION_OPTIONS = [
  'Vestibulaire',
  'Palatine'
]

export default function MiniVisForm({ data, updateData }) {
  return (
    <div>
      <FormSection title="Indications">
        <RadioGroup
          name="minivis-indication"
          options={INDICATION_OPTIONS}
          value={data.indication}
          onChange={(value) => updateData('indication', value)}
        />
      </FormSection>

      <FormSection title="Intervention">
        <RadioGroup
          label="Pré Forage"
          name="minivis-preforage"
          options={OUI_NON}
          value={data.preForage}
          onChange={(value) => updateData('preForage', value)}
          inline
        />

        <TeethSelector
          label="Sélectionner dent(s)"
          selectedTeeth={data.dents}
          onChange={(teeth) => updateData('dents', teeth)}
        />

        <CheckboxGroup
          label="Pose de la Mini Vis"
          options={POSE_MINIVIS_OPTIONS}
          values={data.poseMiniVis}
          onChange={(values) => updateData('poseMiniVis', values)}
          columns={2}
        />

        <RadioGroup
          label="Localisation"
          name="minivis-localisation"
          options={LOCALISATION_OPTIONS}
          value={data.localisation}
          onChange={(value) => updateData('localisation', value)}
          inline
        />

        <div className="mt-4">
          <label className={`
            flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg border-2 transition-all
            ${data.rdvControle ? 'border-cemedis-500 bg-cemedis-50' : 'border-cemedis-200 hover:border-cemedis-300'}
          `}>
            <input
              type="checkbox"
              checked={data.rdvControle || false}
              onChange={(e) => updateData('rdvControle', e.target.checked)}
              className="w-4 h-4 text-cemedis-500 border-cemedis-300 rounded focus:ring-cemedis-500"
            />
            <span className={`text-sm ${data.rdvControle ? 'text-cemedis-700 font-medium' : 'text-cemedis-600'}`}>
              Rendez-vous de contrôle prévu à J+7
            </span>
          </label>
        </div>
      </FormSection>
    </div>
  )
}
