import { useState, useCallback } from 'react'
import { FormSection, FileUpload, QRPhotoCapture } from '../ui'

export default function Step5Imagerie({ formData, updateFormData }) {
  const [isCapturing, setIsCapturing] = useState(false)

  // Use functional update to avoid stale closure when multiple photos arrive quickly
  const handlePhotoReceived = useCallback((photo) => {
    updateFormData('radiographies', (currentPhotos) => [...(currentPhotos || []), photo])
  }, [updateFormData])

  // Simplified screen capture - captures immediately like plan-de-traitement
  const captureScreen = async () => {
    try {
      setIsCapturing(true)

      // Request screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      })

      // Create video element to capture frame
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true
      video.playsInline = true

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play()
          resolve()
        }
      })

      // Small delay to ensure video is ready
      await new Promise(resolve => setTimeout(resolve, 100))

      // Create canvas and capture the frame
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)

      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop())

      // Convert to base64
      const imageData = canvas.toDataURL('image/png')

      // Compress if needed (optional - for large screenshots)
      const compressedData = await compressImage(imageData, 1200, 0.8)

      // Create screenshot object
      const screenshotObj = {
        id: `screenshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        preview: compressedData,
        name: `Radiographie ${new Date().toLocaleDateString('fr-FR')}`,
        isScreenshot: true,
        date: new Date().toLocaleDateString('fr-FR')
      }

      // Add to radiographies using functional update
      updateFormData('radiographies', (currentPhotos) => [...(currentPhotos || []), screenshotObj])

      setIsCapturing(false)

    } catch (error) {
      console.error('Screen capture error:', error)
      setIsCapturing(false)

      if (error.name !== 'NotAllowedError') {
        alert('Erreur lors de la capture d\'écran')
      }
    }
  }

  // Compress image helper function
  const compressImage = (imageDataUrl, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => resolve(imageDataUrl) // Fallback to original
      img.src = imageDataUrl
    })
  }

  return (
    <div>
      <FormSection title="Imagerie">
        <p className="text-sm text-cemedis-600 mb-4">
          Ajoutez les radiographies et autres images liées à l'intervention.
        </p>

        <div className="flex flex-wrap gap-3 mb-4">
          <QRPhotoCapture
            onPhotoReceived={handlePhotoReceived}
            label="Scanner avec téléphone"
          />

          <button
            type="button"
            onClick={captureScreen}
            disabled={isCapturing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
              isCapturing
                ? 'bg-amber-300 text-amber-800 cursor-wait'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isCapturing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Capture en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Capture d'écran
              </>
            )}
          </button>
        </div>

        <FileUpload
          label="Ou importez depuis votre ordinateur"
          files={formData.radiographies}
          onChange={(files) => updateFormData('radiographies', files)}
          accept="image/*,.pdf,.dcm"
          maxFiles={15}
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
