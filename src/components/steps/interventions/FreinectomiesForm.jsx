import { FormSection, RadioGroup, CheckboxGroup } from '../../ui'

const FREINECTOMIE_TYPE_OPTIONS = [
  'Linguale',
  'Labiale Supérieure',
  'Labiale Inférieure'
]

const PROCEDURE_OPTIONS = [
  { value: 'incision', label: 'Incision perpendiculaire au frein au delà de la ligne mucco gingivale' },
  { value: 'desinsertionFibres', label: 'Désinsertion des fibres musculaires' },
  { value: 'suturesCheck', label: 'Sutures' }
]

const SUTURES_OPTIONS = ['Points simples', 'Matelassier Horizontal', 'Surjet']

const FIL_OPTIONS = ['Résorbable', 'Non résorbable']

const TYPE_FIL_OPTIONS = ['3/0', '4/0', '5/0']

const HEMOSTASE_OPTIONS = ['Contrôlée', 'Non contrôlée']

export default function FreinectomiesForm({ data, updateData }) {
  return (
    <div>
      <FormSection title="Type de Freinectomie">
        <CheckboxGroup
          options={FREINECTOMIE_TYPE_OPTIONS}
          values={data.type}
          onChange={(values) => updateData('type', values)}
        />
      </FormSection>

      <FormSection title="Intervention">
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
                onChange={(e) => updateData(option.value, e.target.checked)}
                className="w-4 h-4 text-cemedis-500 border-cemedis-300 rounded focus:ring-cemedis-500"
              />
              <span className={`text-sm ${data[option.value] ? 'text-cemedis-700 font-medium' : 'text-cemedis-600'}`}>
                {option.label}
              </span>
            </label>
          ))}
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
            name="freinectomies-fil"
            options={FIL_OPTIONS}
            value={data.fil}
            onChange={(value) => updateData('fil', value)}
            inline
          />

          <RadioGroup
            label="Type"
            name="freinectomies-type-fil"
            options={TYPE_FIL_OPTIONS}
            value={data.typeFil}
            onChange={(value) => updateData('typeFil', value)}
            inline
          />
        </div>
      </FormSection>

      <FormSection title="Hémostase">
        <RadioGroup
          name="freinectomies-hemostase"
          options={HEMOSTASE_OPTIONS}
          value={data.hemostase}
          onChange={(value) => updateData('hemostase', value)}
          inline
        />
      </FormSection>
    </div>
  )
}
