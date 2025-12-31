import { useState, useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'

export default function MobilePhotoCapture({ peerId }) {
  const [status, setStatus] = useState('connecting') // connecting, connected, error
  const [photos, setPhotos] = useState([])
  const [cameraActive, setCameraActive] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const connRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!peerId) {
      setStatus('error')
      return
    }

    const peer = new Peer()

    peer.on('open', () => {
      const conn = peer.connect(peerId)

      conn.on('open', () => {
        setStatus('connected')
        connRef.current = conn
      })

      conn.on('error', () => {
        setStatus('error')
      })
    })

    peer.on('error', () => {
      setStatus('error')
    })

    return () => {
      peer.destroy()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [peerId])

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
    } catch (err) {
      console.error('Camera error:', err)
      alert('Impossible d\'accéder à la caméra')
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }, [])

  useEffect(() => {
    if (cameraActive) {
      startCamera()
    }
  }, [facingMode, cameraActive, startCamera])

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !connRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)

    const photoData = canvas.toDataURL('image/jpeg', 0.8)

    // Send to desktop
    connRef.current.send({
      type: 'photo',
      photo: photoData
    })

    setPhotos(prev => [...prev, photoData])
  }, [])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-cemedis-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-cemedis-800 mb-2">Erreur de connexion</h2>
          <p className="text-cemedis-600">Impossible de se connecter. Veuillez rescanner le QR code.</p>
        </div>
      </div>
    )
  }

  if (status === 'connecting') {
    return (
      <div className="min-h-screen bg-cemedis-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cemedis-200 border-t-cemedis-500 rounded-full mx-auto mb-4"></div>
          <p className="text-cemedis-600">Connexion en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cemedis-900 flex flex-col">
      {/* Header */}
      <div className="bg-cemedis-800 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold">CR Chirurgie - Photo</h1>
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          Connecté
        </div>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Camera controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={switchCamera}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <button
                  onClick={takePhoto}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <div className="w-16 h-16 border-4 border-cemedis-500 rounded-full"></div>
                </button>

                <button
                  onClick={stopCamera}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <button
              onClick={startCamera}
              className="w-24 h-24 bg-cemedis-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cemedis-600 transition-colors mb-4"
            >
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <p className="text-white text-lg font-medium">Ouvrir la caméra</p>
            <p className="text-cemedis-300 text-sm mt-2">Appuyez pour prendre des photos</p>
          </div>
        )}
      </div>

      {/* Photos taken */}
      {photos.length > 0 && (
        <div className="bg-cemedis-800 p-4">
          <p className="text-white text-sm mb-2">{photos.length} photo(s) envoyée(s)</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
