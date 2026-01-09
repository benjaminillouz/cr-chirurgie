import { useState, useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'

export default function MobilePhotoCapture({ peerId }) {
  const [status, setStatus] = useState('connecting') // connecting, connected, error
  const [photos, setPhotos] = useState([])
  const [cameraActive, setCameraActive] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [showGrid, setShowGrid] = useState(false)

  // Camera capabilities
  const [capabilities, setCapabilities] = useState({
    zoom: null,
    torch: false,
    focusMode: null
  })
  const [currentZoom, setCurrentZoom] = useState(1)
  const [torchOn, setTorchOn] = useState(false)

  const connRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const trackRef = useRef(null)

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

  const detectCapabilities = useCallback((track) => {
    try {
      const caps = track.getCapabilities()
      const newCapabilities = {
        zoom: caps.zoom ? { min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step || 0.1 } : null,
        torch: !!caps.torch,
        focusMode: caps.focusMode || null
      }
      setCapabilities(newCapabilities)

      // Set initial zoom to min if available
      if (newCapabilities.zoom) {
        setCurrentZoom(newCapabilities.zoom.min)
      }

      // Enable continuous autofocus if available
      if (newCapabilities.focusMode && newCapabilities.focusMode.includes('continuous')) {
        track.applyConstraints({ focusMode: 'continuous' })
      }
    } catch (err) {
      console.log('Could not detect capabilities:', err)
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      streamRef.current = stream
      const track = stream.getVideoTracks()[0]
      trackRef.current = track

      // Detect capabilities after a small delay (some devices need this)
      setTimeout(() => detectCapabilities(track), 500)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
      setTorchOn(false)
    } catch (err) {
      console.error('Camera error:', err)
      alert('Impossible d\'accéder à la caméra')
    }
  }, [facingMode, detectCapabilities])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      trackRef.current = null
    }
    setCameraActive(false)
    setTorchOn(false)
    setCapabilities({ zoom: null, torch: false, focusMode: null })
  }, [])

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }, [])

  useEffect(() => {
    if (cameraActive) {
      startCamera()
    }
  }, [facingMode, cameraActive, startCamera])

  // Zoom control
  const handleZoomChange = useCallback((newZoom) => {
    if (!trackRef.current || !capabilities.zoom) return

    try {
      trackRef.current.applyConstraints({
        advanced: [{ zoom: newZoom }]
      })
      setCurrentZoom(newZoom)
    } catch (err) {
      console.error('Zoom error:', err)
    }
  }, [capabilities.zoom])

  // Torch/Flash control
  const toggleTorch = useCallback(async () => {
    if (!trackRef.current || !capabilities.torch) return

    try {
      const newTorchState = !torchOn
      await trackRef.current.applyConstraints({
        advanced: [{ torch: newTorchState }]
      })
      setTorchOn(newTorchState)
    } catch (err) {
      console.error('Torch error:', err)
    }
  }, [capabilities.torch, torchOn])

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

            {/* Grid overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Vertical lines */}
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40"></div>
                {/* Horizontal lines */}
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40"></div>
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40"></div>
              </div>
            )}

            {/* Top controls bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center justify-between">
                {/* Grid toggle */}
                <button
                  onClick={() => setShowGrid(prev => !prev)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    showGrid ? 'bg-white text-cemedis-800' : 'bg-white/20 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 9h16M4 15h16M9 4v16M15 4v16" />
                  </svg>
                </button>

                {/* Torch button (only if supported) */}
                {capabilities.torch && (
                  <button
                    onClick={toggleTorch}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      torchOn ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={torchOn ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Zoom slider (only if supported) */}
            {capabilities.zoom && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                  {currentZoom.toFixed(1)}x
                </span>
                <input
                  type="range"
                  min={capabilities.zoom.min}
                  max={capabilities.zoom.max}
                  step={capabilities.zoom.step}
                  value={currentZoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="h-32 appearance-none bg-transparent cursor-pointer"
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl',
                    WebkitAppearance: 'slider-vertical'
                  }}
                />
                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            )}

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
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
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
