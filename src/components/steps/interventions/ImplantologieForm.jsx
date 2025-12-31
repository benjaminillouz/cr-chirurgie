import { FormSection, RadioGroup, TextInput, Select, TeethSelector } from '../../ui'

const INDICATION_OPTIONS = [
  "Dent(s) mécaniquement(s) non conservable(s)",
  "Echec Implantaire",
  "Dent(s) absente(s)"
]

const OUI_NON = ['Oui', 'Non']

const SEQUENCE_FORAGE = ['Os dur', 'Os mou']

const POSE_CLE_OPTIONS = ['10N', '20N', '30N', '40N', '50N', '60N', '70N', '80N']

const VIS_OPTIONS = ['Couverture', 'Cicatrisation']

const SUTURES_OPTIONS = ['Points simples', 'Matelassier Horizontal', 'Surjet']

const FIL_OPTIONS = ['Résorbable', 'Non résorbable']

const TYPE_FIL_OPTIONS = ['3/0', '4/0', '5/0']

const HEMOSTASE_OPTIONS = ['Contrôlée', 'Non contrôlée']

export default function ImplantologieForm({ data, updateData }) {
  return (
    <div>
      <FormSection title="Indications">
        <RadioGroup
          name="implanto-indication"
          options={INDICATION_OPTIONS}
          value={data.indication}
          onChange={(value) => updateData('indication', value)}
        />
      </FormSection>

      <FormSection title="Intervention">
        <TeethSelector
          label="Pose d'implant(s) intra-osseux sur"
          selectedTeeth={data.dentsImplants}
          onChange={(teeth) => updateData('dentsImplants', teeth)}
        />

        <TextInput
          label="Incision"
          value={data.incision}
          onChange={(value) => updateData('incision', value)}
          placeholder="Décrire l'incision..."
        />

        <RadioGroup
          label="Incision de décharge"
          name="implanto-incision-decharge"
          options={OUI_NON}
          value={data.incisionDecharge}
          onChange={(value) => updateData('incisionDecharge', value)}
          inline
        />

        <RadioGroup
          label="Séquence de forage"
          name="implanto-sequence-forage"
          options={SEQUENCE_FORAGE}
          value={data.sequenceForage}
          onChange={(value) => updateData('sequenceForage', value)}
          inline
        />

        <RadioGroup
          label="Séquence Ostéotome"
          name="implanto-sequence-osteotome"
          options={OUI_NON}
          value={data.sequenceOsteotome}
          onChange={(value) => updateData('sequenceOsteotome', value)}
          inline
        />

        {data.sequenceOsteotome === 'Oui' && (
          <TextInput
            label="Hauteur Os résiduel"
            value={data.hauteurOsResiduel}
            onChange={(value) => updateData('hauteurOsResiduel', value)}
            placeholder="Ex: 5mm"
          />
        )}

        <Select
          label="Pose d'implant à la clé"
          value={data.poseCle}
          onChange={(value) => updateData('poseCle', value)}
          options={POSE_CLE_OPTIONS}
        />
      </FormSection>

      <FormSection title="Vis">
        <RadioGroup
          name="implanto-vis"
          options={VIS_OPTIONS}
          value={data.vis}
          onChange={(value) => updateData('vis', value)}
          inline
        />
      </FormSection>

      <FormSection title="Sutures">
        <RadioGroup
          name="implanto-sutures"
          options={SUTURES_OPTIONS}
          value={data.sutures}
          onChange={(value) => updateData('sutures', value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RadioGroup
            label="Fil"
            name="implanto-fil"
            options={FIL_OPTIONS}
            value={data.fil}
            onChange={(value) => updateData('fil', value)}
            inline
          />

          <RadioGroup
            label="Type"
            name="implanto-type-fil"
            options={TYPE_FIL_OPTIONS}
            value={data.typeFil}
            onChange={(value) => updateData('typeFil', value)}
            inline
          />
        </div>
      </FormSection>

      <FormSection title="Hémostase">
        <RadioGroup
          name="implanto-hemostase"
          options={HEMOSTASE_OPTIONS}
          value={data.hemostase}
          onChange={(value) => updateData('hemostase', value)}
          inline
        />
      </FormSection>
    </div>
  )
}
