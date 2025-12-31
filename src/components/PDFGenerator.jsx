import { useState, useEffect, useRef } from 'react'
import { jsPDF } from 'jspdf'

const INTERVENTION_LABELS = {
  'Implantologie': 'Implantologie',
  'Chirurgie Pré Implantaire': 'Chirurgie Pré Implantaire',
  'Avulsions': 'Avulsions',
  'Freinectomies': 'Freinectomies',
  'Mini Vis': 'Mini Vis'
}

export default function PDFGenerator({ formData, onClose }) {
  const [isGenerating, setIsGenerating] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfRef, setPdfRef] = useState(null)
  const iframeRef = useRef(null)

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Helper to add a line with label and value
  const addLine = (pdf, label, value, margin, yPos, labelWidth = 50) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return yPos
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${label}: `, margin, yPos)
    pdf.setFont('helvetica', 'normal')
    const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
    pdf.text(displayValue, margin + labelWidth, yPos)
    return yPos + 6
  }

  // Helper to check if we need a new page
  const checkNewPage = (pdf, yPos, margin, pageHeight, needed = 20) => {
    if (yPos + needed > pageHeight - margin) {
      pdf.addPage()
      return margin
    }
    return yPos
  }

  // Helper to add images section
  const addImagesSection = (pdf, images, title, margin, yPos, pageWidth, pageHeight) => {
    if (!images || images.length === 0) return yPos

    yPos = checkNewPage(pdf, yPos, margin, pageHeight, 80)

    pdf.setTextColor(0, 75, 99)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, margin, yPos)
    yPos += 8

    const imgWidth = 80
    const imgHeight = 60
    let xPos = margin
    let imagesInRow = 0

    for (const img of images) {
      if (!img.preview) continue

      yPos = checkNewPage(pdf, yPos, margin, pageHeight, imgHeight + 10)
      if (yPos === margin) {
        xPos = margin
        imagesInRow = 0
      }

      try {
        pdf.addImage(img.preview, 'JPEG', xPos, yPos, imgWidth, imgHeight)

        // Add image name below
        pdf.setTextColor(100, 100, 100)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        const imgName = img.name || `Image ${imagesInRow + 1}`
        pdf.text(imgName.substring(0, 20), xPos, yPos + imgHeight + 4)

        imagesInRow++
        if (imagesInRow === 2) {
          xPos = margin
          yPos += imgHeight + 12
          imagesInRow = 0
        } else {
          xPos += imgWidth + 10
        }
      } catch (e) {
        console.error('Error adding image:', e)
      }
    }

    // If we ended with one image in the row, move to next row
    if (imagesInRow === 1) {
      yPos += imgHeight + 12
    }

    return yPos + 5
  }

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      let yPos = margin

      // Header
      pdf.setFillColor(0, 75, 99)
      pdf.rect(0, 0, pageWidth, 35, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('COMPTE RENDU OPÉRATOIRE', pageWidth / 2, 15, { align: 'center' })

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Date: ${formatDate(formData.interventionDate)} - ${formData.interventionTime || ''}`, pageWidth / 2, 25, { align: 'center' })

      yPos = 45

      // Patient info section
      pdf.setTextColor(0, 75, 99)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('INFORMATIONS PATIENT', margin, yPos)
      yPos += 8

      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(10)

      yPos = addLine(pdf, 'Nom', formData.patientName, margin, yPos, 35)
      yPos = addLine(pdf, 'Prénom', formData.patientSurname, margin, yPos, 35)
      yPos = addLine(pdf, 'Établissement', formData.centre, margin, yPos, 35)
      yPos = addLine(pdf, 'Praticien', formData.praticien, margin, yPos, 35)

      yPos += 5

      // Intervention section
      pdf.setTextColor(0, 75, 99)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('INTERVENTION', margin, yPos)
      yPos += 8

      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(10)

      const typeLabel = INTERVENTION_LABELS[formData.interventionType] || formData.interventionType || '-'
      yPos = addLine(pdf, 'Type', typeLabel, margin, yPos, 35)

      // Intervention-specific details
      const interventionType = formData.interventionType

      if (interventionType === 'Implantologie' && formData.implanto) {
        const imp = formData.implanto
        yPos = addLine(pdf, 'Indication', imp.indication, margin, yPos, 50)
        yPos = addLine(pdf, 'Dents/Implants', imp.dentsImplants, margin, yPos, 50)
        yPos = addLine(pdf, 'Incision', imp.incision, margin, yPos, 50)
        yPos = addLine(pdf, 'Décharge', imp.incisionDecharge, margin, yPos, 50)
        yPos = addLine(pdf, 'Séquence forage', imp.sequenceForage, margin, yPos, 50)
        yPos = addLine(pdf, 'Séquence ostéotome', imp.sequenceOsteotome, margin, yPos, 50)
        yPos = addLine(pdf, 'Hauteur os résiduel', imp.hauteurOsResiduel, margin, yPos, 50)
        yPos = addLine(pdf, 'Pose clé', imp.poseCle, margin, yPos, 50)
        yPos = addLine(pdf, 'Vis', imp.vis, margin, yPos, 50)
        yPos = addLine(pdf, 'Sutures', imp.sutures, margin, yPos, 50)
        yPos = addLine(pdf, 'Fil', imp.fil, margin, yPos, 50)
        yPos = addLine(pdf, 'Type fil', imp.typeFil, margin, yPos, 50)
        yPos = addLine(pdf, 'Hémostase', imp.hemostase, margin, yPos, 50)
      }

      if (interventionType === 'Chirurgie Pré Implantaire' && formData.chirurgiePreImplantaire) {
        const chir = formData.chirurgiePreImplantaire
        yPos = addLine(pdf, 'Indication', chir.indication, margin, yPos, 50)
        yPos = addLine(pdf, 'Incision', chir.incision, margin, yPos, 50)
        yPos = addLine(pdf, 'Décharge', chir.incisionDecharge, margin, yPos, 50)
        if (chir.avulsionSeparation) yPos = addLine(pdf, 'Avulsion/Séparation', 'Oui', margin, yPos, 50)
        yPos = addLine(pdf, 'Dents extraites', chir.dentsExtraites, margin, yPos, 50)
        if (chir.revisionPlaie) yPos = addLine(pdf, 'Révision plaie', 'Oui', margin, yPos, 50)
        if (chir.nettoyageCHX) yPos = addLine(pdf, 'Nettoyage CHX', 'Oui', margin, yPos, 50)
        yPos = addLine(pdf, 'Biomatériaux', chir.biomateriaux, margin, yPos, 50)
        yPos = addLine(pdf, 'Sutures', chir.sutures, margin, yPos, 50)
        yPos = addLine(pdf, 'Fil', chir.fil, margin, yPos, 50)
        yPos = addLine(pdf, 'Type fil', chir.typeFil, margin, yPos, 50)
        yPos = addLine(pdf, 'Hémostase', chir.hemostase, margin, yPos, 50)
      }

      if (interventionType === 'Avulsions' && formData.avulsions) {
        const avul = formData.avulsions
        yPos = addLine(pdf, 'Indication', avul.indication, margin, yPos, 50)
        yPos = addLine(pdf, 'Dents', avul.dents, margin, yPos, 50)
        yPos = addLine(pdf, 'Lambeau', avul.lambeau, margin, yPos, 50)
        yPos = addLine(pdf, 'Type incision', avul.typeIncision, margin, yPos, 50)
        yPos = addLine(pdf, 'Décharge', avul.incisionDecharge, margin, yPos, 50)
        yPos = addLine(pdf, 'Alvéolectomie', avul.alveolectomie, margin, yPos, 50)
        yPos = addLine(pdf, 'Localisation', avul.localisation, margin, yPos, 50)
        yPos = addLine(pdf, 'Séparation racines', avul.separationRacines, margin, yPos, 50)
        if (avul.revisionPlaie) yPos = addLine(pdf, 'Révision plaie', 'Oui', margin, yPos, 50)
        if (avul.rincageCHX) yPos = addLine(pdf, 'Rinçage CHX', 'Oui', margin, yPos, 50)
        yPos = addLine(pdf, 'Sutures', avul.sutures, margin, yPos, 50)
        yPos = addLine(pdf, 'Fil', avul.fil, margin, yPos, 50)
        yPos = addLine(pdf, 'Type fil', avul.typeFil, margin, yPos, 50)
        yPos = addLine(pdf, 'Hémostase', avul.hemostase, margin, yPos, 50)
      }

      if (interventionType === 'Mini Vis' && formData.miniVis) {
        const mv = formData.miniVis
        yPos = addLine(pdf, 'Indication', mv.indication, margin, yPos, 50)
        yPos = addLine(pdf, 'Pré-forage', mv.preForage, margin, yPos, 50)
        yPos = addLine(pdf, 'Dents', mv.dents, margin, yPos, 50)
        yPos = addLine(pdf, 'Pose mini vis', mv.poseMiniVis, margin, yPos, 50)
        yPos = addLine(pdf, 'Localisation', mv.localisation, margin, yPos, 50)
        if (mv.rdvControle) yPos = addLine(pdf, 'RDV contrôle', 'Oui', margin, yPos, 50)
      }

      if (interventionType === 'Freinectomies' && formData.freinectomies) {
        const fr = formData.freinectomies
        yPos = addLine(pdf, 'Type', fr.type, margin, yPos, 50)
        if (fr.incision) yPos = addLine(pdf, 'Incision', 'Oui', margin, yPos, 50)
        if (fr.desinsertionFibres) yPos = addLine(pdf, 'Désinsertion fibres', 'Oui', margin, yPos, 50)
        if (fr.suturesCheck) yPos = addLine(pdf, 'Sutures', 'Oui', margin, yPos, 50)
        yPos = addLine(pdf, 'Type sutures', fr.sutures, margin, yPos, 50)
        yPos = addLine(pdf, 'Fil', fr.fil, margin, yPos, 50)
        yPos = addLine(pdf, 'Type fil', fr.typeFil, margin, yPos, 50)
        yPos = addLine(pdf, 'Hémostase', fr.hemostase, margin, yPos, 50)
      }

      yPos += 5
      yPos = checkNewPage(pdf, yPos, margin, pageHeight, 40)

      // Pre-operative section
      pdf.setTextColor(0, 75, 99)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PRÉ-OPÉRATOIRE', margin, yPos)
      yPos += 8

      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(10)

      yPos = addLine(pdf, 'Prémédication', formData.premedication, margin, yPos, 45)
      yPos = addLine(pdf, 'Anesthésie', formData.anesthesie, margin, yPos, 45)
      yPos = addLine(pdf, 'Nb carpules', formData.nombreCarpules, margin, yPos, 45)
      yPos = addLine(pdf, 'Rappels anesthésiques', formData.rappelsAnesthesiques, margin, yPos, 45)
      yPos = addLine(pdf, 'Antisepsie locale', formData.antisepsieLocale, margin, yPos, 45)

      // Observations
      if (formData.observations) {
        yPos += 5
        yPos = checkNewPage(pdf, yPos, margin, pageHeight, 30)

        pdf.setTextColor(0, 75, 99)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('OBSERVATIONS', margin, yPos)
        yPos += 8

        pdf.setTextColor(60, 60, 60)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')

        const splitText = pdf.splitTextToSize(formData.observations, pageWidth - 2 * margin)
        pdf.text(splitText, margin, yPos)
        yPos += splitText.length * 5
      }

      // Post-operative
      yPos += 5
      yPos = checkNewPage(pdf, yPos, margin, pageHeight, 25)

      pdf.setTextColor(0, 75, 99)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('SUIVI POST-OPÉRATOIRE', margin, yPos)
      yPos += 8

      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(10)

      yPos = addLine(pdf, 'Fiche conseils remise', formData.ficheConseilsRemise, margin, yPos, 50)
      yPos = addLine(pdf, 'RDV contrôle J+', formData.rdvControleJour, margin, yPos, 50)

      // Traçabilité images (separate section)
      const tracabiliteImages = (formData.tracabilitePhotos || []).filter(img => img.preview)
      if (tracabiliteImages.length > 0) {
        yPos += 10
        yPos = addImagesSection(pdf, tracabiliteImages, 'TRAÇABILITÉ', margin, yPos, pageWidth, pageHeight)
      }

      // Radiographies images (separate section)
      const radiographiesImages = (formData.radiographies || []).filter(img => img.preview)
      if (radiographiesImages.length > 0) {
        yPos += 10
        yPos = addImagesSection(pdf, radiographiesImages, 'RADIOGRAPHIES', margin, yPos, pageWidth, pageHeight)
      }

      // Footer on last page
      const lastPage = pdf.internal.getNumberOfPages()
      pdf.setPage(lastPage)
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )

      // Generate blob and URL for preview
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)

      setPdfBlob(blob)
      setPdfUrl(url)
      setPdfRef(pdf)

      return pdf
    } catch (error) {
      console.error('PDF generation error:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate PDF on mount
  useEffect(() => {
    generatePDF()

    // Cleanup URL on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [])

  const handleDownload = () => {
    if (!pdfRef) return
    const filename = `CR_${formData.patientName || 'Patient'}_${formData.patientSurname || ''}_${formatDate(formData.interventionDate).replace(/\//g, '-')}.pdf`
    pdfRef.save(filename)
  }

  const handlePrint = () => {
    if (!pdfUrl) return
    const printWindow = window.open(pdfUrl)
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const shareViaEmail = () => {
    const patientName = `${formData.patientName || ''} ${formData.patientSurname || ''}`.trim()
    const subject = encodeURIComponent(`Compte Rendu Opératoire - ${patientName}`)
    const body = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint le compte rendu opératoire de ${patientName}.\n\nCordialement`)

    const mailto = formData.patientMail
      ? `mailto:${formData.patientMail}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`

    window.open(mailto)
  }

  const shareViaWhatsApp = () => {
    const patientName = `${formData.patientName || ''} ${formData.patientSurname || ''}`.trim()
    const text = encodeURIComponent(`Compte Rendu Opératoire - ${patientName}\nDate: ${formatDate(formData.interventionDate)}`)
    window.open(`https://wa.me/?text=${text}`)
  }

  const shareNative = async () => {
    if (!pdfBlob || !navigator.share) return

    const file = new File([pdfBlob], 'compte-rendu.pdf', { type: 'application/pdf' })
    try {
      await navigator.share({
        title: 'Compte Rendu Opératoire',
        files: [file]
      })
    } catch (e) {
      console.error('Share failed:', e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:h-[90vh] overflow-hidden animate-fade-in flex flex-col">
        <div className="bg-cemedis-500 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-sm sm:text-base">Compte rendu opératoire</h3>
          <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {isGenerating ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8">
                <div className="animate-spin w-12 h-12 border-4 border-cemedis-200 border-t-cemedis-500 rounded-full mx-auto mb-4"></div>
                <p className="text-cemedis-600">Génération du PDF en cours...</p>
              </div>
            </div>
          ) : showShareModal ? (
            <div className="p-6">
              <p className="text-cemedis-700 font-medium mb-4 text-center">Partager le compte rendu</p>

              <div className="space-y-3 max-w-md mx-auto">
                <button
                  onClick={shareViaEmail}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-blue-700 font-medium">Envoyer par Email</span>
                </button>

                <button
                  onClick={shareViaWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span className="text-green-700 font-medium">Partager via WhatsApp</span>
                </button>

                {navigator.share && (
                  <button
                    onClick={shareNative}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                    <span className="text-purple-700 font-medium">Autres options de partage</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-6 px-4 py-2 text-cemedis-600 hover:text-cemedis-700 transition-colors"
              >
                Retour
              </button>
            </div>
          ) : (
            <>
              {/* PDF Preview - takes most of the space */}
              <div className="flex-1 p-2 sm:p-4 bg-gray-100 min-h-0 overflow-hidden">
                {pdfUrl && (
                  <iframe
                    ref={iframeRef}
                    src={pdfUrl}
                    className="w-full h-full rounded-lg border border-gray-300 bg-white"
                    style={{ minHeight: '400px' }}
                    title="Aperçu du compte rendu"
                  />
                )}
              </div>

              {/* Action buttons */}
              <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-cemedis-500 text-white rounded-lg hover:bg-cemedis-600 transition-colors text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="hidden xs:inline sm:inline">Télécharger</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 border-2 border-cemedis-500 text-cemedis-700 rounded-lg hover:bg-cemedis-50 transition-colors text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span className="hidden xs:inline sm:inline">Imprimer</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 border-2 border-amber-500 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="hidden xs:inline sm:inline">Partager</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
