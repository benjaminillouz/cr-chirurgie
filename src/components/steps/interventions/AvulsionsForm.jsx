import { FormSection, RadioGroup, TextInput, CheckboxGroup, TeethSelector } from '../../ui'

const INDICATION_OPTIONS = [
  "Dent(s) mécaniquement(s) non conservable(s)",
  "Elimination foyers infectieux",
  "Indications Orthodontiques",
  "Dents de sagesse"
]

const OUI_NON = ['Oui', 'Non']

const LOCALISATION_OPTIONS = [
  'Mésiale',
  'Distale',
  'Vestibulaire',
  'Linguale/Palatine'
]

const SUTURES_OPTIONS = ['Points simples', 'Matelassier Horizontal', 'Surjet']

const FIL_OPTIONS = ['Résorbable', 'Non résorbable']

const TYPE_FIL_OPTIONS = ['3/0', '4/0', '5/0']

const HEMOSTASE_OPTIONS = ['Contrôlée', 'Non contrôlée']

export default function AvulsionsForm({ data, updateData }) {
  return (
    <div>
      <FormSection title="Indications">
        <RadioGroup
          name="avulsions-indication"
          options={INDICATION_OPTIONS}
          value={data.indication}
          onChange={(value) => updateData('indication', value)}
        />
      </FormSection>

      <FormSection title="Intervention">
        <TeethSelector
          label="Sélectionner dent(s)"
          selectedTeeth={data.dents}
          onChange={(teeth) => updateData('dents', teeth)}
        />

        <RadioGroup
          label="Lambeau"
          name="avulsions-lambeau"
          options={OUI_NON}
          value={data.lambeau}
          onChange={(value) => updateData('lambeau', value)}
          inline
        />

        {data.lambeau === 'Oui' && (
          <TextInput
            label="Type d'incision"
            value={data.typeIncision}
            onChange={(value) => updateData('typeIncision', value)}
            placeholder="Décrire le type d'incision..."
          />
        )}

        <RadioGroup
          label="Incision de décharge"
          name="avulsions-incision-decharge"
          options={OUI_NON}
          value={data.incisionDecharge}
          onChange={(value) => updateData('incisionDecharge', value)}
          inline
        />

        <RadioGroup
          label="Alvéolectomie"
          name="avulsions-alveolectomie"
          options={OUI_NON}
          value={data.alveolectomie}
          onChange={(value) => updateData('alveolectomie', value)}
          inline
        />

        <CheckboxGroup
          label="Localisation"
          options={LOCALISATION_OPTIONS}
          values={data.localisation}
          onChange={(values) => updateData('localisation', values)}
          columns={2}
        />

        <RadioGroup
          label="Séparation de racines"
          name="avulsions-separation-racines"
          options={OUI_NON}
          value={data.separationRacines}
          onChange={(value) => updateData('separationRacines', value)}
          inline
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-cemedis-700 mb-2">
            Procédures complémentaires
          </label>
          <div className="flex flex-wrap gap-3">
            <label className={`
              flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-lg border-2 transition-all
              ${data.revisionPlaie ? 'border-cemedis-500 bg-cemedis-50' : 'border-cemedis-200 hover:border-cemedis-300'}
            `}>
              <input
                type="checkbox"
                checked={data.revisionPlaie || false}
                onChange={(e) => updateData('revisionPlaie', e.target.checked)}
                className="w-4 h-4 text-cemedis-500 border-cemedis-300 rounded focus:ring-cemedis-500"
              />
              <span className={`text-sm ${data.revisionPlaie ? 'text-cemedis-700 font-medium' : 'text-cemedis-600'}`}>
                Révision plaie
              </span>
            </label>
            <label className={`
              flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-lg border-2 transition-all
              ${data.rincageCHX ? 'border-cemedis-500 bg-cemedis-50' : 'border-cemedis-200 hover:border-cemedis-300'}
            `}>
              <input
                type="checkbox"
                checked={data.rincageCHX || false}
                onChange={(e) => updateData('rincageCHX', e.target.checked)}
                className="w-4 h-4 text-cemedis-500 border-cemedis-300 rounded focus:ring-cemedis-500"
              />
              <span className={`text-sm ${data.rincageCHX ? 'text-cemedis-700 font-medium' : 'text-cemedis-600'}`}>
                Rinçage CHX
              </span>
            </label>
          </div>
        </div>
      </FormSection>

      <FormSection title="Sutures">
        <CheckboxGroup
          options={SUTURES_OPTIONS}
          values={data.sutures}
          onChange={(values) => updateData('sutures', values)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RadioGroup
            label="Fil"
            name="avulsions-fil"
            options={FIL_OPTIONS}
            value={data.fil}
            onChange={(value) => updateData('fil', value)}
            inline
          />

          <RadioGroup
            label="Type"
            name="avulsions-type-fil"
            options={TYPE_FIL_OPTIONS}
            value={data.typeFil}
            onChange={(value) => updateData('typeFil', value)}
            inline
          />
        </div>
      </FormSection>

      <FormSection title="Hémostase">
        <RadioGroup
          name="avulsions-hemostase"
          options={HEMOSTASE_OPTIONS}
          value={data.hemostase}
          onChange={(value) => updateData('hemostase', value)}
          inline
        />
      </FormSection>
    </div>
  )
}
