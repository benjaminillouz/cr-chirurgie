import { FormSection, RadioGroup, TextInput, CheckboxGroup, TeethSelector } from '../../ui'

const INDICATION_OPTIONS = [
  "Dent(s) mécaniquement(s) non conservable(s)",
  "Volume osseux résiduel insuffisant"
]

const OUI_NON = ['Oui', 'Non']

const PROCEDURE_OPTIONS = [
  { value: 'avulsionSeparation', label: 'Avulsion avec séparation de racine' },
  { value: 'revisionPlaie', label: 'Révision de la plaie' },
  { value: 'nettoyageCHX', label: 'Nettoyage au CHX' }
]

const BIOMATERIAUX_OPTIONS = [
  'Endobond',
  'Regeneros',
  'Membrane copios',
  'Membrane osseoguard',
  'Grille titane',
  'Pins'
]

const SUTURES_OPTIONS = ['Points simples', 'Matelassier Horizontal', 'Surjet']

const FIL_OPTIONS = ['Résorbable', 'Non résorbable']

const TYPE_FIL_OPTIONS = ['3/0', '4/0', '5/0']

const HEMOSTASE_OPTIONS = ['Contrôlée', 'Non contrôlée']

export default function ChirurgiePreImplantaireForm({ data, updateData }) {
  const handleProcedureChange = (value, checked) => {
    updateData(value, checked)
  }

  return (
    <div>
      <FormSection title="Indications">
        <RadioGroup
          name="chirurgie-indication"
          options={INDICATION_OPTIONS}
          value={data.indication}
          onChange={(value) => updateData('indication', value)}
        />
      </FormSection>

      <FormSection title="Intervention">
        <TextInput
          label="Incision"
          value={data.incision}
          onChange={(value) => updateData('incision', value)}
          placeholder="Décrire l'incision..."
        />

        <RadioGroup
          label="Incision de décharge"
          name="chirurgie-incision-decharge"
          options={OUI_NON}
          value={data.incisionDecharge}
          onChange={(value) => updateData('incisionDecharge', value)}
          inline
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-cemedis-700 mb-2">
            Procédures
          </label>
          <div className="space-y-2">
            {PROCEDURE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg border-2 transition-all
                  ${data[option.value]
                    ? 'border-cemedis-500 bg-cemedis-50'
                    : 'border-cemedis-200 hover:border-cemedis-300'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={data[option.value] || false}
                  onChange={(e) => handleProcedureChange(option.value, e.target.checked)}
                  className="w-4 h-4 text-cemedis-500 border-cemedis-300 rounded focus:ring-cemedis-500"
                />
                <span className={`text-sm ${data[option.value] ? 'text-cemedis-700 font-medium' : 'text-cemedis-600'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {data.avulsionSeparation && (
          <TeethSelector
            label="Sélectionner dents extraites"
            selectedTeeth={data.dentsExtraites}
            onChange={(teeth) => updateData('dentsExtraites', teeth)}
          />
        )}
      </FormSection>

      <FormSection title="Mise en place biomatériaux">
        <CheckboxGroup
          options={BIOMATERIAUX_OPTIONS}
          values={data.biomateriaux}
          onChange={(values) => updateData('biomateriaux', values)}
          columns={2}
        />
      </FormSection>

      <FormSection title="Sutures">
        <RadioGroup
          name="chirurgie-sutures"
          options={SUTURES_OPTIONS}
          value={data.sutures}
          onChange={(value) => updateData('sutures', value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RadioGroup
            label="Fil"
            name="chirurgie-fil"
            options={FIL_OPTIONS}
            value={data.fil}
            onChange={(value) => updateData('fil', value)}
            inline
          />

          <RadioGroup
            label="Type"
            name="chirurgie-type-fil"
            options={TYPE_FIL_OPTIONS}
            value={data.typeFil}
            onChange={(value) => updateData('typeFil', value)}
            inline
          />
        </div>
      </FormSection>

      <FormSection title="Hémostase">
        <RadioGroup
          name="chirurgie-hemostase"
          options={HEMOSTASE_OPTIONS}
          value={data.hemostase}
          onChange={(value) => updateData('hemostase', value)}
          inline
        />
      </FormSection>
    </div>
  )
}
