import { useState, useRef, useCallback } from 'react'
import { FormSection, FileUpload, QRPhotoCapture } from '../ui'

export default function Step5Imagerie({ formData, updateFormData }) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturePreview, setCapturePreview] = useState(null)
  const [captureCount, setCaptureCount] = useState(0)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const handlePhotoReceived = (photo) => {
    const currentPhotos = formData.radiographies || []
    updateFormData('radiographies', [...currentPhotos, photo])
  }

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCapturing(true)
      setCaptureCount(0)

      stream.getVideoTracks()[0].onended = () => {
        stopScreenCapture()
      }
    } catch (err) {
      console.error('Screen capture error:', err)
    }
  }

  const takeScreenshot = useCallback(() => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)

    const screenshotData = canvas.toDataURL('image/png')
    setCapturePreview(screenshotData)
  }, [])

  const saveScreenshot = useCallback(() => {
    if (!capturePreview) return

    const screenshotObj = {
      id: `screenshot-${Date.now()}`,
      preview: capturePreview,
      name: `capture-${new Date().toISOString().slice(0, 10)}-${captureCount + 1}.png`,
      isScreenshot: true
    }

    const currentPhotos = formData.radiographies || []
    updateFormData('radiographies', [...currentPhotos, screenshotObj])
    setCapturePreview(null)
    setCaptureCount(prev => prev + 1)
    // Don't close - allow taking more captures
  }, [capturePreview, formData.radiographies, updateFormData, captureCount])

  const stopScreenCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
    setCapturePreview(null)
    setCaptureCount(0)
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
            onClick={startScreenCapture}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Capture d'écran
          </button>
        </div>

        {/* Screen capture modal */}
        {isCapturing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
              <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Capture d'écran</h3>
                  {captureCount > 0 && (
                    <p className="text-sm text-amber-100">{captureCount} capture(s) enregistrée(s)</p>
                  )}
                </div>
                <button onClick={stopScreenCapture} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {capturePreview ? (
                  <div>
                    <img src={capturePreview} alt="Capture" className="w-full rounded-lg border border-cemedis-200 mb-4" />
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setCapturePreview(null)}
                        className="px-4 py-2 border border-cemedis-300 text-cemedis-700 rounded-lg hover:bg-cemedis-50 transition-colors"
                      >
                        Reprendre
                      </button>
                      <button
                        onClick={saveScreenshot}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg border border-cemedis-200 mb-4"
                    />
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={takeScreenshot}
                        className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Capturer
                      </button>
                      {captureCount > 0 && (
                        <button
                          onClick={stopScreenCapture}
                          className="px-6 py-3 bg-cemedis-500 text-white rounded-lg hover:bg-cemedis-600 transition-colors"
                        >
                          Terminé
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
