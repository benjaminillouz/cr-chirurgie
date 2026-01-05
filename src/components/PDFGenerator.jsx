import { useState, useEffect, useRef, useCallback } from 'react'
import { jsPDF } from 'jspdf'
import Peer from 'peerjs'
import { QRCodeSVG } from 'qrcode.react'

const PDF_SHARE_URL = window.location.origin + window.location.pathname

// FDI Tooth numbering system
const TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41]
}

const INTERVENTION_LABELS = {
  'Implantologie': 'Implantologie',
  'Chirurgie Pré Implantaire': 'Chirurgie Pré Implantaire',
  'Avulsions': 'Avulsions',
  'Freinectomies': 'Freinectomies',
  'Mini Vis': 'Mini Vis'
}

// Colors
const COLORS = {
  primary: [0, 75, 99],        // cemedis-500
  primaryLight: [230, 244, 248], // cemedis-50
  secondary: [245, 158, 11],   // amber-500
  success: [34, 197, 94],      // green-500
  text: [60, 60, 60],
  textLight: [120, 120, 120],
  white: [255, 255, 255],
  border: [200, 220, 230]
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

  // Draw section header with colored background
  const drawSectionHeader = (pdf, title, margin, yPos, pageWidth) => {
    pdf.setFillColor(...COLORS.primaryLight)
    pdf.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 10, 2, 2, 'F')
    pdf.setTextColor(...COLORS.primary)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, margin + 4, yPos + 2)
    return yPos + 12
  }

  // Draw a badge/pill
  const drawBadge = (pdf, text, x, y, bgColor, textColor = COLORS.white) => {
    const textWidth = pdf.getTextWidth(text)
    const padding = 3
    const height = 6
    const width = textWidth + padding * 2

    pdf.setFillColor(...bgColor)
    pdf.roundedRect(x, y - 4, width, height, 1.5, 1.5, 'F')
    pdf.setTextColor(...textColor)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text(text, x + padding, y)

    return width + 2
  }

  // Draw a field with label and value
  const drawField = (pdf, label, value, margin, yPos, pageWidth) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return yPos

    pdf.setTextColor(...COLORS.textLight)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(label, margin, yPos)

    pdf.setTextColor(...COLORS.text)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
    const splitText = pdf.splitTextToSize(displayValue, pageWidth - margin - 70)
    pdf.text(splitText, margin + 55, yPos)

    return yPos + Math.max(6, splitText.length * 5)
  }

  // Draw dental chart
  const drawDentalChart = (pdf, selectedTeeth, margin, yPos, pageWidth) => {
    if (!selectedTeeth || selectedTeeth.length === 0) return yPos

    const chartWidth = pageWidth - 2 * margin
    const toothSize = 9
    const toothGap = 2
    const centerX = pageWidth / 2

    // Title
    pdf.setTextColor(...COLORS.primary)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Schéma dentaire', margin, yPos)
    yPos += 8

    // Background
    pdf.setFillColor(250, 252, 254)
    pdf.setDrawColor(...COLORS.border)
    pdf.roundedRect(margin, yPos - 2, chartWidth, 45, 3, 3, 'FD')

    // Calculate starting positions
    const rowWidth = 8 * toothSize + 7 * toothGap
    const startX = centerX - rowWidth - 3

    // Draw upper row (18-11 | 21-28)
    let x = startX
    const upperY = yPos + 8

    // Upper right (18-11)
    TEETH.upperRight.forEach((tooth) => {
      const isSelected = selectedTeeth.includes(tooth.toString())
      if (isSelected) {
        pdf.setFillColor(...COLORS.primary)
        pdf.setTextColor(...COLORS.white)
      } else {
        pdf.setFillColor(...COLORS.white)
        pdf.setDrawColor(...COLORS.border)
        pdf.setTextColor(...COLORS.textLight)
      }
      pdf.roundedRect(x, upperY, toothSize, toothSize, 1, 1, isSelected ? 'F' : 'FD')
      pdf.setFontSize(6)
      pdf.text(tooth.toString(), x + 1.5, upperY + 6)
      x += toothSize + toothGap
    })

    // Separator line
    pdf.setDrawColor(...COLORS.primary)
    pdf.setLineWidth(0.5)
    pdf.line(centerX, upperY, centerX, upperY + toothSize)

    // Upper left (21-28)
    x = centerX + 3
    TEETH.upperLeft.forEach((tooth) => {
      const isSelected = selectedTeeth.includes(tooth.toString())
      if (isSelected) {
        pdf.setFillColor(...COLORS.primary)
        pdf.setTextColor(...COLORS.white)
      } else {
        pdf.setFillColor(...COLORS.white)
        pdf.setDrawColor(...COLORS.border)
        pdf.setTextColor(...COLORS.textLight)
      }
      pdf.roundedRect(x, upperY, toothSize, toothSize, 1, 1, isSelected ? 'F' : 'FD')
      pdf.setFontSize(6)
      pdf.text(tooth.toString(), x + 1.5, upperY + 6)
      x += toothSize + toothGap
    })

    // Horizontal separator
    const lowerY = upperY + toothSize + 6
    pdf.setDrawColor(...COLORS.border)
    pdf.setLineWidth(0.3)
    pdf.line(margin + 10, upperY + toothSize + 3, pageWidth - margin - 10, upperY + toothSize + 3)

    // Lower row (48-41 | 31-38)
    x = startX

    // Lower right (48-41)
    TEETH.lowerRight.forEach((tooth) => {
      const isSelected = selectedTeeth.includes(tooth.toString())
      if (isSelected) {
        pdf.setFillColor(...COLORS.primary)
        pdf.setTextColor(...COLORS.white)
      } else {
        pdf.setFillColor(...COLORS.white)
        pdf.setDrawColor(...COLORS.border)
        pdf.setTextColor(...COLORS.textLight)
      }
      pdf.roundedRect(x, lowerY, toothSize, toothSize, 1, 1, isSelected ? 'F' : 'FD')
      pdf.setFontSize(6)
      pdf.text(tooth.toString(), x + 1.5, lowerY + 6)
      x += toothSize + toothGap
    })

    // Separator line
    pdf.setDrawColor(...COLORS.primary)
    pdf.setLineWidth(0.5)
    pdf.line(centerX, lowerY, centerX, lowerY + toothSize)

    // Lower left (31-38)
    x = centerX + 3
    TEETH.lowerLeft.forEach((tooth) => {
      const isSelected = selectedTeeth.includes(tooth.toString())
      if (isSelected) {
        pdf.setFillColor(...COLORS.primary)
        pdf.setTextColor(...COLORS.white)
      } else {
        pdf.setFillColor(...COLORS.white)
        pdf.setDrawColor(...COLORS.border)
        pdf.setTextColor(...COLORS.textLight)
      }
      pdf.roundedRect(x, lowerY, toothSize, toothSize, 1, 1, isSelected ? 'F' : 'FD')
      pdf.setFontSize(6)
      pdf.text(tooth.toString(), x + 1.5, lowerY + 6)
      x += toothSize + toothGap
    })

    // Legend
    yPos = lowerY + toothSize + 8
    pdf.setFontSize(8)
    pdf.setTextColor(...COLORS.textLight)
    pdf.text(`${selectedTeeth.length} dent(s) sélectionnée(s): ${selectedTeeth.sort((a, b) => a - b).join(', ')}`, margin + 4, yPos)

    return yPos + 8
  }

  // Check if we need a new page
  const checkNewPage = (pdf, yPos, margin, pageHeight, needed = 20) => {
    if (yPos + needed > pageHeight - margin) {
      pdf.addPage()
      return margin + 5
    }
    return yPos
  }

  // Add images section
  const addImagesSection = (pdf, images, title, icon, margin, yPos, pageWidth, pageHeight) => {
    if (!images || images.length === 0) return yPos

    yPos = checkNewPage(pdf, yPos, margin, pageHeight, 80)
    yPos = drawSectionHeader(pdf, `${title} (${images.length})`, margin, yPos, pageWidth)

    const imgWidth = 75
    const imgHeight = 55
    let xPos = margin
    let imagesInRow = 0

    for (const img of images) {
      if (!img.preview) continue

      yPos = checkNewPage(pdf, yPos, margin, pageHeight, imgHeight + 15)
      if (yPos === margin + 5) {
        xPos = margin
        imagesInRow = 0
      }

      try {
        // Image border
        pdf.setDrawColor(...COLORS.border)
        pdf.setLineWidth(0.5)
        pdf.roundedRect(xPos - 1, yPos - 1, imgWidth + 2, imgHeight + 2, 2, 2, 'S')

        pdf.addImage(img.preview, 'JPEG', xPos, yPos, imgWidth, imgHeight)

        // Image name below
        pdf.setTextColor(...COLORS.textLight)
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'normal')
        const imgName = img.name || `Image ${imagesInRow + 1}`
        pdf.text(imgName.substring(0, 25), xPos, yPos + imgHeight + 5)

        imagesInRow++
        if (imagesInRow === 2) {
          xPos = margin
          yPos += imgHeight + 12
          imagesInRow = 0
        } else {
          xPos += imgWidth + 15
        }
      } catch (e) {
        console.error('Error adding image:', e)
      }
    }

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

      // ===== HEADER =====
      pdf.setFillColor(...COLORS.primary)
      pdf.rect(0, 0, pageWidth, 40, 'F')

      // Title
      pdf.setTextColor(...COLORS.white)
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('COMPTE RENDU OPÉRATOIRE', pageWidth / 2, 18, { align: 'center' })

      // Date and time badge
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const dateText = `${formatDate(formData.interventionDate)} à ${formData.interventionTime || '--:--'}`
      pdf.text(dateText, pageWidth / 2, 30, { align: 'center' })

      // Intervention type badge
      const typeLabel = INTERVENTION_LABELS[formData.interventionType] || formData.interventionType
      if (typeLabel) {
        pdf.setFillColor(...COLORS.secondary)
        const badgeWidth = pdf.getTextWidth(typeLabel) + 10
        pdf.roundedRect((pageWidth - badgeWidth) / 2, 33, badgeWidth, 7, 2, 2, 'F')
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'bold')
        pdf.text(typeLabel, pageWidth / 2, 38, { align: 'center' })
      }

      yPos = 50

      // ===== PATIENT INFO =====
      yPos = drawSectionHeader(pdf, 'INFORMATIONS PATIENT', margin, yPos, pageWidth)

      // Patient info in a nice box
      pdf.setFillColor(...COLORS.white)
      pdf.setDrawColor(...COLORS.border)
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 28, 3, 3, 'FD')

      const col1X = margin + 5
      const col2X = pageWidth / 2 + 5

      pdf.setTextColor(...COLORS.text)
      pdf.setFontSize(10)

      // Row 1
      pdf.setFont('helvetica', 'bold')
      pdf.text('Patient:', col1X, yPos + 8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${formData.patientName || ''} ${formData.patientSurname || ''}`.trim() || '-', col1X + 20, yPos + 8)

      pdf.setFont('helvetica', 'bold')
      pdf.text('Praticien:', col2X, yPos + 8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(formData.praticien || '-', col2X + 25, yPos + 8)

      // Row 2
      pdf.setFont('helvetica', 'bold')
      pdf.text('Centre:', col1X, yPos + 18)
      pdf.setFont('helvetica', 'normal')
      const centreText = formData.centre || '-'
      const truncatedCentre = centreText.length > 40 ? centreText.substring(0, 40) + '...' : centreText
      pdf.text(truncatedCentre, col1X + 20, yPos + 18)

      yPos += 35

      // ===== PRÉ-OPÉRATOIRE =====
      yPos = drawSectionHeader(pdf, 'PRÉ-OPÉRATOIRE', margin, yPos, pageWidth)

      // Pre-op in structured box
      const preOpBoxHeight = 42
      pdf.setFillColor(...COLORS.white)
      pdf.setDrawColor(...COLORS.border)
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, preOpBoxHeight, 3, 3, 'FD')

      const labelX = margin + 5
      const valueX = margin + 45
      let preOpY = yPos + 8

      // Prémédication
      pdf.setTextColor(...COLORS.textLight)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Prémédication:', labelX, preOpY)
      if (formData.premedication?.length > 0) {
        let badgeX = valueX
        formData.premedication.forEach(med => {
          badgeX += drawBadge(pdf, med, badgeX, preOpY, COLORS.primary) + 3
        })
      } else {
        pdf.setTextColor(...COLORS.text)
        pdf.text('-', valueX, preOpY)
      }

      preOpY += 10

      // Anesthésie
      pdf.setTextColor(...COLORS.textLight)
      pdf.setFontSize(9)
      pdf.text('Anesthésie:', labelX, preOpY)
      if (formData.anesthesie?.length > 0 || formData.nombreCarpules) {
        let badgeX = valueX
        if (formData.anesthesie?.length > 0) {
          formData.anesthesie.forEach(anesth => {
            badgeX += drawBadge(pdf, anesth, badgeX, preOpY, [59, 130, 246]) + 3 // blue
          })
        }
        if (formData.nombreCarpules) {
          badgeX += drawBadge(pdf, `${formData.nombreCarpules} carpule(s)`, badgeX, preOpY, COLORS.success) + 3
        }
      } else {
        pdf.setTextColor(...COLORS.text)
        pdf.text('-', valueX, preOpY)
      }

      preOpY += 10

      // Antisepsie
      pdf.setTextColor(...COLORS.textLight)
      pdf.setFontSize(9)
      pdf.text('Antisepsie:', labelX, preOpY)
      if (formData.antisepsieLocale?.length > 0) {
        let badgeX = valueX
        formData.antisepsieLocale.forEach(antisep => {
          badgeX += drawBadge(pdf, antisep, badgeX, preOpY, [168, 85, 247]) + 3 // purple
        })
      } else {
        pdf.setTextColor(...COLORS.text)
        pdf.text('-', valueX, preOpY)
      }

      yPos += preOpBoxHeight + 8

      // ===== INTERVENTION DETAILS =====
      yPos = checkNewPage(pdf, yPos, margin, pageHeight, 60)
      yPos = drawSectionHeader(pdf, 'DÉTAILS INTERVENTION', margin, yPos, pageWidth)

      const interventionType = formData.interventionType

      // Get selected teeth based on intervention type
      let selectedTeeth = []
      if (interventionType === 'Implantologie' && formData.implanto?.dentsImplants) {
        selectedTeeth = formData.implanto.dentsImplants
      } else if (interventionType === 'Chirurgie Pré Implantaire' && formData.chirurgiePreImplantaire?.dentsExtraites) {
        selectedTeeth = formData.chirurgiePreImplantaire.dentsExtraites
      } else if (interventionType === 'Avulsions' && formData.avulsions?.dents) {
        selectedTeeth = formData.avulsions.dents
      } else if (interventionType === 'Mini Vis' && formData.miniVis?.dents) {
        selectedTeeth = formData.miniVis.dents
      }

      // Draw dental chart if teeth are selected
      if (selectedTeeth.length > 0) {
        yPos = drawDentalChart(pdf, selectedTeeth, margin, yPos, pageWidth)
        yPos += 5
      }

      // Intervention-specific fields
      yPos = checkNewPage(pdf, yPos, margin, pageHeight, 40)

      if (interventionType === 'Implantologie' && formData.implanto) {
        const imp = formData.implanto
        yPos = drawField(pdf, 'Indication', imp.indication, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Incision', imp.incision, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Décharge', imp.incisionDecharge, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Séq. forage', imp.sequenceForage, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Ostéotome', imp.sequenceOsteotome, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Hauteur os', imp.hauteurOsResiduel, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Pose clé', imp.poseCle, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Vis', imp.vis, margin, yPos, pageWidth)

        // Sutures in a grouped box
        if (imp.sutures || imp.fil || imp.typeFil) {
          yPos = checkNewPage(pdf, yPos, margin, pageHeight, 20)
          pdf.setFillColor(252, 252, 253)
          pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 2, 2, 'F')
          pdf.setTextColor(...COLORS.textLight)
          pdf.setFontSize(8)
          pdf.text('Sutures:', margin + 3, yPos + 5)
          let sutureText = [imp.sutures, imp.fil, imp.typeFil].filter(Boolean).join(' • ')
          pdf.setTextColor(...COLORS.text)
          pdf.text(sutureText, margin + 22, yPos + 5)
          yPos += 15
        }

        yPos = drawField(pdf, 'Hémostase', imp.hemostase, margin, yPos, pageWidth)
      }

      if (interventionType === 'Chirurgie Pré Implantaire' && formData.chirurgiePreImplantaire) {
        const chir = formData.chirurgiePreImplantaire
        yPos = drawField(pdf, 'Indication', chir.indication, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Incision', chir.incision, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Décharge', chir.incisionDecharge, margin, yPos, pageWidth)
        if (chir.avulsionSeparation) yPos = drawField(pdf, 'Avulsion/Sép.', 'Oui', margin, yPos, pageWidth)
        if (chir.revisionPlaie) yPos = drawField(pdf, 'Révision plaie', 'Oui', margin, yPos, pageWidth)
        if (chir.nettoyageCHX) yPos = drawField(pdf, 'Nettoyage CHX', 'Oui', margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Biomatériaux', chir.biomateriaux, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Sutures', [chir.sutures, chir.fil, chir.typeFil].filter(Boolean).join(' • '), margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Hémostase', chir.hemostase, margin, yPos, pageWidth)
      }

      if (interventionType === 'Avulsions' && formData.avulsions) {
        const avul = formData.avulsions
        yPos = drawField(pdf, 'Indication', avul.indication, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Lambeau', avul.lambeau, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Type incision', avul.typeIncision, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Décharge', avul.incisionDecharge, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Alvéolectomie', avul.alveolectomie, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Localisation', avul.localisation, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Séparation rac.', avul.separationRacines, margin, yPos, pageWidth)
        if (avul.revisionPlaie) yPos = drawField(pdf, 'Révision plaie', 'Oui', margin, yPos, pageWidth)
        if (avul.rincageCHX) yPos = drawField(pdf, 'Rinçage CHX', 'Oui', margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Sutures', [avul.sutures, avul.fil, avul.typeFil].filter(Boolean).join(' • '), margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Hémostase', avul.hemostase, margin, yPos, pageWidth)
      }

      if (interventionType === 'Mini Vis' && formData.miniVis) {
        const mv = formData.miniVis
        yPos = drawField(pdf, 'Indication', mv.indication, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Pré-forage', mv.preForage, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Pose mini vis', mv.poseMiniVis, margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Localisation', mv.localisation, margin, yPos, pageWidth)
        if (mv.rdvControle) yPos = drawField(pdf, 'RDV contrôle', 'Prévu', margin, yPos, pageWidth)
      }

      if (interventionType === 'Freinectomies' && formData.freinectomies) {
        const fr = formData.freinectomies
        yPos = drawField(pdf, 'Type', fr.type, margin, yPos, pageWidth)
        if (fr.incision) yPos = drawField(pdf, 'Incision', 'Oui', margin, yPos, pageWidth)
        if (fr.desinsertionFibres) yPos = drawField(pdf, 'Désinsertion', 'Oui', margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Sutures', [fr.sutures, fr.fil, fr.typeFil].filter(Boolean).join(' • '), margin, yPos, pageWidth)
        yPos = drawField(pdf, 'Hémostase', fr.hemostase, margin, yPos, pageWidth)
      }

      // ===== OBSERVATIONS =====
      if (formData.observations) {
        yPos += 5
        yPos = checkNewPage(pdf, yPos, margin, pageHeight, 35)
        yPos = drawSectionHeader(pdf, 'OBSERVATIONS', margin, yPos, pageWidth)

        pdf.setFillColor(...COLORS.white)
        pdf.setDrawColor(...COLORS.border)
        const obsLines = pdf.splitTextToSize(formData.observations, pageWidth - 2 * margin - 10)
        const obsHeight = Math.max(15, obsLines.length * 5 + 6)
        pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, obsHeight, 3, 3, 'FD')

        pdf.setTextColor(...COLORS.text)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(obsLines, margin + 5, yPos + 6)
        yPos += obsHeight + 5
      }

      // ===== SUIVI POST-OP =====
      yPos += 3
      yPos = checkNewPage(pdf, yPos, margin, pageHeight, 25)
      yPos = drawSectionHeader(pdf, 'SUIVI POST-OPÉRATOIRE', margin, yPos, pageWidth)

      // Post-op info in a highlighted box
      pdf.setFillColor(254, 252, 232) // yellow-50
      pdf.setDrawColor(250, 204, 21) // yellow-400
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 18, 3, 3, 'FD')

      pdf.setTextColor(...COLORS.text)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Fiche conseils:', margin + 5, yPos + 7)
      pdf.setFont('helvetica', 'normal')
      pdf.text(formData.ficheConseilsRemise || 'Non renseigné', margin + 40, yPos + 7)

      pdf.setFont('helvetica', 'bold')
      pdf.text('RDV contrôle:', margin + 5, yPos + 14)
      pdf.setFont('helvetica', 'normal')
      pdf.text(formData.rdvControleJour ? `J+${formData.rdvControleJour}` : 'Non renseigné', margin + 40, yPos + 14)

      yPos += 25

      // ===== TRAÇABILITÉ =====
      const tracabiliteImages = (formData.tracabilitePhotos || []).filter(img => img.preview)
      if (tracabiliteImages.length > 0) {
        yPos = addImagesSection(pdf, tracabiliteImages, 'TRAÇABILITÉ', '📋', margin, yPos, pageWidth, pageHeight)
      }

      // ===== RADIOGRAPHIES =====
      const radiographiesImages = (formData.radiographies || []).filter(img => img.preview)
      if (radiographiesImages.length > 0) {
        yPos = addImagesSection(pdf, radiographiesImages, 'RADIOGRAPHIES', '🔬', margin, yPos, pageWidth, pageHeight)
      }

      // ===== FOOTER =====
      const lastPage = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= lastPage; i++) {
        pdf.setPage(i)

        // Footer line
        pdf.setDrawColor(...COLORS.border)
        pdf.setLineWidth(0.3)
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

        // Footer text
        pdf.setFontSize(8)
        pdf.setTextColor(...COLORS.textLight)
        pdf.text(
          `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
          margin,
          pageHeight - 10
        )
        pdf.text(
          `Page ${i}/${lastPage}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
        )
      }

      // Generate blob and URL
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

  useEffect(() => {
    generatePDF()
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
      printWindow.onload = () => printWindow.print()
    }
  }

  const handleShare = () => setShowShareModal(true)

  const getFileName = () => {
    return `CR_${formData.patientName || 'Patient'}_${formData.patientSurname || ''}_${formatDate(formData.interventionDate).replace(/\//g, '-')}.pdf`
  }

  const getPatientName = () => {
    return `${formData.patientName || ''} ${formData.patientSurname || ''}`.trim() || 'Patient'
  }

  // Check if native share supports files
  const canShareFiles = () => {
    return navigator.share && navigator.canShare && navigator.canShare({ files: [new File([''], 'test.pdf', { type: 'application/pdf' })] })
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Compte Rendu Opératoire - ${getPatientName()}`)
    const body = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint le compte rendu opératoire de ${getPatientName()}.\n\nCordialement`)
    const mailto = formData.patientMail ? `mailto:${formData.patientMail}?subject=${subject}&body=${body}` : `mailto:?subject=${subject}&body=${body}`
    window.open(mailto)
  }

  const shareViaWhatsApp = async () => {
    // Try native share with file first (works on mobile)
    if (pdfBlob && canShareFiles()) {
      const file = new File([pdfBlob], getFileName(), { type: 'application/pdf' })
      try {
        await navigator.share({
          title: `Compte Rendu - ${getPatientName()}`,
          text: `Compte Rendu Opératoire - ${getPatientName()}`,
          files: [file]
        })
        return
      } catch (e) {
        console.log('Native share cancelled or failed, falling back to URL')
      }
    }
    // Fallback to text-only (will open WhatsApp but without file)
    const text = encodeURIComponent(`Compte Rendu Opératoire - ${getPatientName()}\nDate: ${formatDate(formData.interventionDate)}\n\n(Téléchargez le PDF depuis l'application pour l'envoyer)`)
    window.open(`https://wa.me/?text=${text}`)
  }

  // Gmail OAuth configuration
  const GMAIL_CLIENT_ID = '77466324556-s2siqrgbdj9qt0hu45s9oqsa4n5650in.apps.googleusercontent.com'
  const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.compose'

  const [gmailLoading, setGmailLoading] = useState(false)
  const [gmailError, setGmailError] = useState(null)

  const [gmailRecipient, setGmailRecipient] = useState('')
  const [showGmailForm, setShowGmailForm] = useState(false)

  // Veasy integration
  const [veasyLoading, setVeasyLoading] = useState(false)
  const [veasyError, setVeasyError] = useState(null)
  const [veasySuccess, setVeasySuccess] = useState(false)

  // QR PDF Share (for WhatsApp on desktop)
  const [showQRShare, setShowQRShare] = useState(false)
  const [qrPeerId, setQrPeerId] = useState(null)
  const [qrPeerStatus, setQrPeerStatus] = useState('disconnected')
  const [qrTransferStatus, setQrTransferStatus] = useState(null)
  const qrPeerRef = useRef(null)

  const generateQrPeerId = () => {
    return 'pdf-' + Math.random().toString(36).substring(2, 10)
  }

  const initializeQrPeer = useCallback(() => {
    if (qrPeerRef.current) {
      qrPeerRef.current.destroy()
    }

    const newPeerId = generateQrPeerId()
    setQrPeerStatus('connecting')
    setQrTransferStatus(null)

    const peer = new Peer(newPeerId, { debug: 0 })

    peer.on('open', (id) => {
      setQrPeerId(id)
      setQrPeerStatus('waiting')
    })

    peer.on('connection', (conn) => {
      setQrPeerStatus('connected')

      conn.on('open', async () => {
        // Send PDF data to mobile
        if (pdfBlob) {
          setQrTransferStatus('sending')
          try {
            const arrayBuffer = await pdfBlob.arrayBuffer()
            const base64Pdf = btoa(
              new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            )
            conn.send({
              type: 'pdf',
              data: base64Pdf,
              filename: getFileName(),
              patientName: getPatientName()
            })
            setQrTransferStatus('sent')
          } catch (err) {
            console.error('Error sending PDF:', err)
            setQrTransferStatus('error')
          }
        }
      })

      conn.on('close', () => {
        setQrPeerStatus('waiting')
      })
    })

    peer.on('error', (err) => {
      console.error('QR Peer error:', err)
      setQrPeerStatus('disconnected')
    })

    qrPeerRef.current = peer
  }, [pdfBlob])

  const openQRShare = () => {
    setShowQRShare(true)
    initializeQrPeer()
  }

  const closeQRShare = () => {
    setShowQRShare(false)
    if (qrPeerRef.current) {
      qrPeerRef.current.destroy()
      qrPeerRef.current = null
    }
    setQrPeerId(null)
    setQrPeerStatus('disconnected')
    setQrTransferStatus(null)
  }

  // Detect if on mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const shareViaGmail = async () => {
    if (!pdfBlob) return

    // Check if Google Identity Services is loaded
    if (!window.google?.accounts?.oauth2) {
      setGmailError('Service Gmail non disponible. Veuillez rafraîchir la page.')
      return
    }

    // Check for recipient email
    const recipient = gmailRecipient || formData.patientMail
    if (!recipient) {
      setShowGmailForm(true)
      return
    }

    setGmailLoading(true)
    setGmailError(null)

    try {
      // Request OAuth token
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GMAIL_CLIENT_ID,
        scope: GMAIL_SCOPES,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setGmailError('Authentification annulée')
            setGmailLoading(false)
            return
          }

          try {
            const draftId = await createGmailDraft(tokenResponse.access_token)
            setGmailLoading(false)
            // Open Gmail with the draft ready to send
            window.open(`https://mail.google.com/mail/u/0/#drafts?compose=${draftId}`, '_blank')
          } catch (err) {
            console.error('Gmail draft error:', err)
            setGmailError('Erreur lors de la création: ' + err.message)
            setGmailLoading(false)
          }
        }
      })

      tokenClient.requestAccessToken()
    } catch (err) {
      console.error('Gmail OAuth error:', err)
      setGmailError('Erreur d\'authentification Gmail')
      setGmailLoading(false)
    }
  }

  const createGmailDraft = async (accessToken) => {
    const patientEmail = gmailRecipient || formData.patientMail || ''

    if (!patientEmail) {
      throw new Error('Adresse email du destinataire requise')
    }
    const subject = `Compte Rendu Opératoire - ${getPatientName()}`
    const body = `Bonjour,\n\nVeuillez trouver ci-joint le compte rendu opératoire de ${getPatientName()} du ${formatDate(formData.interventionDate)}.\n\nCordialement`

    // Convert blob to base64
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const base64Pdf = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    // Create MIME message
    const boundary = 'boundary_' + Date.now()
    const mimeMessage = [
      `To: ${patientEmail}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${getFileName()}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${getFileName()}"`,
      '',
      base64Pdf,
      '',
      `--${boundary}--`
    ].join('\r\n')

    // Encode for Gmail API
    const encodedMessage = btoa(unescape(encodeURIComponent(mimeMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Create draft via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: { raw: encodedMessage } })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur Gmail API')
    }

    const data = await response.json()
    return data.message.id
  }

  const shareNative = async () => {
    if (!pdfBlob || !navigator.share) return
    const file = new File([pdfBlob], getFileName(), { type: 'application/pdf' })
    try {
      await navigator.share({ title: 'Compte Rendu Opératoire', files: [file] })
    } catch (e) {
      console.error('Share failed:', e)
    }
  }

  // Save to Veasy
  const saveToVeasy = async () => {
    if (!pdfBlob) return

    setVeasyLoading(true)
    setVeasyError(null)
    setVeasySuccess(false)

    try {
      // Convert PDF blob to base64
      const arrayBuffer = await pdfBlob.arrayBuffer()
      const base64Pdf = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      // Prepare payload
      const payload = {
        patient: {
          id: formData.patientId || `${Date.now()}`,
          name: formData.patientName || '',
          firstName: formData.patientSurname || '',
          date: formData.interventionDate || new Date().toISOString().split('T')[0],
          examiner: formData.praticien || ''
        },
        pdf_base64: base64Pdf
      }

      // Send to Veasy webhook
      const response = await fetch('https://n8n.cemedis.app/webhook/26db458d-4967-47f0-8f7f-f4b71ef872f5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      setVeasySuccess(true)
      setTimeout(() => setVeasySuccess(false), 3000)
    } catch (err) {
      console.error('Veasy save error:', err)
      setVeasyError(err.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setVeasyLoading(false)
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
            <div className="p-6 overflow-y-auto">
              <p className="text-cemedis-700 font-medium mb-4 text-center">Partager le compte rendu</p>

              {gmailError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {gmailError}
                </div>
              )}

              <div className="space-y-3 max-w-md mx-auto">
                {/* Gmail email input form */}
                {showGmailForm && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email du destinataire
                    </label>
                    <input
                      type="email"
                      value={gmailRecipient}
                      onChange={(e) => setGmailRecipient(e.target.value)}
                      placeholder="exemple@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (gmailRecipient) {
                            setShowGmailForm(false)
                            shareViaGmail()
                          }
                        }}
                        disabled={!gmailRecipient}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Envoyer
                      </button>
                      <button
                        onClick={() => setShowGmailForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Gmail - avec pièce jointe via OAuth */}
                <button
                  onClick={shareViaGmail}
                  disabled={gmailLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center">
                    {gmailLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-red-700 font-medium block">Préparer dans Gmail</span>
                    <span className="text-red-500 text-xs">Ouvre un brouillon avec la pièce jointe</span>
                  </div>
                </button>

                {/* Instructions OAuth */}
                {gmailLoading && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                    <p className="font-medium mb-1">Si un avertissement Google apparaît :</p>
                    <ol className="list-decimal list-inside space-y-1 text-amber-700">
                      <li>Cliquez sur <strong>"Paramètres avancés"</strong></li>
                      <li>Puis sur <strong>"Accéder à cemedis.app (non sécurisé)"</strong></li>
                      <li>Autorisez la création de brouillons</li>
                    </ol>
                  </div>
                )}

                {/* Email classique - mailto */}
                <button onClick={shareViaEmail} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-blue-700 font-medium block">Autre client email</span>
                    <span className="text-blue-500 text-xs">Ouvre votre app email (sans PJ)</span>
                  </div>
                </button>

                {/* WhatsApp - QR code on desktop, native share on mobile */}
                <button
                  onClick={() => {
                    if (isMobile()) {
                      shareViaWhatsApp()
                    } else {
                      openQRShare()
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-green-700 font-medium block">WhatsApp</span>
                    <span className="text-green-500 text-xs">
                      {isMobile()
                        ? (canShareFiles() ? 'Avec fichier PDF' : 'Message texte')
                        : 'Scanner le QR code avec votre téléphone'}
                    </span>
                  </div>
                </button>

                {/* Partage natif (mobile) */}
                {navigator.share && (
                  <button onClick={shareNative} className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-purple-700 font-medium block">Autres options</span>
                      <span className="text-purple-500 text-xs">Partage système avec fichier</span>
                    </div>
                  </button>
                )}
              </div>

              <button onClick={() => { setShowShareModal(false); setGmailError(null); }} className="w-full mt-6 px-4 py-2 text-cemedis-600 hover:text-cemedis-700 transition-colors">
                Retour
              </button>
            </div>
          ) : (
            <>
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
              <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button onClick={handleDownload} className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-cemedis-500 text-white rounded-lg hover:bg-cemedis-600 transition-colors text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="hidden xs:inline sm:inline">Télécharger</span>
                  </button>
                  <button onClick={handlePrint} className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 border-2 border-cemedis-500 text-cemedis-700 rounded-lg hover:bg-cemedis-50 transition-colors text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span className="hidden xs:inline sm:inline">Imprimer</span>
                  </button>
                  <button onClick={handleShare} className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 border-2 border-amber-500 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="hidden xs:inline sm:inline">Partager</span>
                  </button>
                </div>

                {/* Veasy integration */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {veasyError && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs text-center">
                      {veasyError}
                    </div>
                  )}
                  {veasySuccess && (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs text-center">
                      Enregistré dans Veasy avec succès !
                    </div>
                  )}
                  <button
                    onClick={saveToVeasy}
                    disabled={veasyLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {veasyLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                    <span className="font-medium">Enregistrer dans Veasy</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Code Share Modal */}
      {showQRShare && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-green-500 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold">Partager via WhatsApp</h3>
              <button onClick={closeQRShare} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {qrPeerStatus === 'connecting' && (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full mx-auto mb-4"></div>
                  <p className="text-green-600">Connexion en cours...</p>
                </div>
              )}

              {qrPeerStatus === 'waiting' && qrPeerId && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-lg border border-gray-100">
                    <QRCodeSVG
                      value={`${PDF_SHARE_URL}?pdf=1&peer=${qrPeerId}`}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-green-700 font-medium mb-2">
                    Scannez avec votre téléphone
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Le PDF sera transféré sur votre mobile pour le partager via WhatsApp
                  </p>
                  <div className="flex items-center justify-center gap-2 text-amber-600 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    En attente de connexion...
                  </div>
                </div>
              )}

              {qrPeerStatus === 'connected' && (
                <div className="text-center py-4">
                  {qrTransferStatus === 'sending' && (
                    <>
                      <div className="animate-spin w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full mx-auto mb-4"></div>
                      <p className="text-green-700 font-medium">Transfert du PDF en cours...</p>
                    </>
                  )}
                  {qrTransferStatus === 'sent' && (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-700 font-medium mb-2">PDF transféré avec succès !</p>
                      <p className="text-sm text-gray-500">Partagez-le maintenant depuis votre téléphone</p>
                    </>
                  )}
                  {qrTransferStatus === 'error' && (
                    <>
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-red-700 font-medium">Erreur lors du transfert</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={closeQRShare}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
