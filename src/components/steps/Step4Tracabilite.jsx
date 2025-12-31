import { FormSection, FileUpload } from '../ui'

export default function Step4Tracabilite({ formData, updateFormData }) {
  return (
    <div>
      <FormSection title="Traçabilité implantaire">
        <p className="text-sm text-cemedis-600 mb-4">
          Ajoutez les photos des étiquettes de traçabilité des implants utilisés pendant l'intervention.
        </p>

        <FileUpload
          label="Photos des étiquettes de traçabilité"
          files={formData.tracabilitePhotos}
          onChange={(files) => updateFormData('tracabilitePhotos', files)}
          accept="image/*,.pdf"
          maxFiles={5}
        />

        <div className="mt-4 p-4 bg-cemedis-50 rounded-lg border border-cemedis-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cemedis-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-cemedis-700">Information</h4>
              <p className="text-sm text-cemedis-600 mt-1">
                Les photos des étiquettes permettent d'assurer la traçabilité complète des dispositifs médicaux implantés conformément à la réglementation en vigueur.
              </p>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  )
}
