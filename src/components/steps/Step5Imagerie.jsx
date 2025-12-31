import { FormSection, FileUpload } from '../ui'

export default function Step5Imagerie({ formData, updateFormData }) {
  return (
    <div>
      <FormSection title="Imagerie">
        <p className="text-sm text-cemedis-600 mb-4">
          Ajoutez les radiographies et autres images liées à l'intervention.
        </p>

        <FileUpload
          label="Radiographies"
          files={formData.radiographies}
          onChange={(files) => updateFormData('radiographies', files)}
          accept="image/*,.pdf,.dcm"
          maxFiles={10}
        />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-cemedis-50 rounded-lg border border-cemedis-200 text-center">
            <svg className="w-8 h-8 text-cemedis-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-cemedis-600">Panoramique</p>
          </div>
          <div className="p-4 bg-cemedis-50 rounded-lg border border-cemedis-200 text-center">
            <svg className="w-8 h-8 text-cemedis-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-cemedis-600">Rétro-alvéolaire</p>
          </div>
          <div className="p-4 bg-cemedis-50 rounded-lg border border-cemedis-200 text-center">
            <svg className="w-8 h-8 text-cemedis-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-cemedis-600">CBCT</p>
          </div>
        </div>
      </FormSection>
    </div>
  )
}
