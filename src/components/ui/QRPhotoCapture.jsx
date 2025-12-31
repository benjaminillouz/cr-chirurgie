import { useState, useEffect, useCallback, useRef } from 'react'
import Peer from 'peerjs'
import { QRCodeSVG } from 'qrcode.react'

const PHOTO_APP_URL = window.location.origin + window.location.pathname

export default function QRPhotoCapture({ onPhotoReceived, label = "Ajouter une photo" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [peerId, setPeerId] = useState(null)
  const [peerStatus, setPeerStatus] = useState('disconnected') // disconnected, connecting, waiting, connected
  const [receivedPhotos, setReceivedPhotos] = useState([])
  const peerRef = useRef(null)

  const generatePeerId = () => {
    return 'cr-' + Math.random().toString(36).substring(2, 10)
  }

  const initializePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy()
    }

    const newPeerId = generatePeerId()
    setPeerStatus('connecting')

    const peer = new Peer(newPeerId, {
      debug: 0
    })

    peer.on('open', (id) => {
      setPeerId(id)
      setPeerStatus('waiting')
    })

    peer.on('connection', (conn) => {
      setPeerStatus('connected')

      conn.on('data', (data) => {
        if (data.type === 'photo') {
          const photoObj = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            preview: data.photo,
            name: `photo-${Date.now()}.jpg`,
            fromMobile: true
          }
          setReceivedPhotos(prev => [...prev, photoObj])
          onPhotoReceived(photoObj)
        }
      })

      conn.on('close', () => {
        setPeerStatus('waiting')
      })
    })

    peer.on('error', (err) => {
      console.error('Peer error:', err)
      setPeerStatus('disconnected')
    })

    peerRef.current = peer
  }, [onPhotoReceived])

  const openModal = () => {
    setIsOpen(true)
    setReceivedPhotos([])
    initializePeer()
  }

  const closeModal = () => {
    setIsOpen(false)
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }
    setPeerId(null)
    setPeerStatus('disconnected')
  }

  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy()
      }
    }
  }, [])

  const qrUrl = peerId ? `${PHOTO_APP_URL}?photo=1&peer=${peerId}` : ''

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2.5 bg-cemedis-500 text-white rounded-lg hover:bg-cemedis-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-cemedis-500 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold">Scanner pour prendre une photo</h3>
              <button onClick={closeModal} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {peerStatus === 'connecting' && (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-cemedis-200 border-t-cemedis-500 rounded-full mx-auto mb-4"></div>
                  <p className="text-cemedis-600">Connexion en cours...</p>
                </div>
              )}

              {peerStatus === 'waiting' && peerId && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-lg">
                    <QRCodeSVG
                      value={qrUrl}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-cemedis-700 font-medium mb-2">
                    Scannez avec votre téléphone
                  </p>
                  <p className="text-sm text-cemedis-500 mb-4">
                    La photo sera envoyée directement ici
                  </p>
                  <div className="flex items-center justify-center gap-2 text-amber-600 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    En attente de connexion...
                  </div>
                </div>
              )}

              {peerStatus === 'connected' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-700 font-medium mb-2">Téléphone connecté !</p>
                  <p className="text-sm text-cemedis-500">Prenez vos photos depuis votre téléphone</p>
                </div>
              )}

              {receivedPhotos.length > 0 && (
                <div className="mt-6 pt-6 border-t border-cemedis-100">
                  <p className="text-sm font-medium text-cemedis-700 mb-3">
                    Photos reçues ({receivedPhotos.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {receivedPhotos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.preview}
                        alt="Photo reçue"
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-cemedis-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-cemedis-500 text-white rounded-lg hover:bg-cemedis-600 transition-colors"
              >
                Terminé
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
