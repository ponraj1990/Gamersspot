import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const generateInvoicePDF = async (invoiceData, elementId = 'invoice-content') => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Invoice element not found')
  }

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const imgScaledWidth = imgWidth * ratio
  const imgScaledHeight = imgHeight * ratio
  const xOffset = (pdfWidth - imgScaledWidth) / 2
  const yOffset = (pdfHeight - imgScaledHeight) / 2

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight)
  
  const fileName = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`
  pdf.save(fileName)
  
  return fileName
}

