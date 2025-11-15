import { useState } from 'react'
import { formatTime } from '../utils/timer'
import { calculateCost } from '../utils/pricing'
import { generateInvoicePDF } from '../utils/pdf'

const InvoiceViewer = ({ invoice, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  if (!invoice) return null

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      await generateInvoicePDF(invoice, 'invoice-content')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const invoiceDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        <div id="invoice-content" className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gamers Spot</h1>
            <p className="text-gray-600 font-semibold">Game Zone</p>
            <p className="text-gray-600">Invoice #{invoice.invoiceNumber}</p>
            <p className="text-gray-600">Date: {invoiceDate}</p>
          </div>

          <div className="mb-6 border-t border-b border-gray-200 py-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Station</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">Time</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">Extras</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.stations.map((station, index) => {
                  const elapsed = station.elapsedTime || 0
                  const gameType = station.gameType || 'PlayStation'
                  const cost = calculateCost(
                    elapsed,
                    gameType,
                    station.hasExtraController || false,
                    station.hasSteeringWheel || false
                  )
                  const extras = []
                  if (station.hasExtraController) extras.push('Extra Controller')
                  if (station.hasSteeringWheel) extras.push('Steering Wheel')
                  
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-4 text-gray-800">{station.name}</td>
                      <td className="py-2 px-4 text-gray-600">{gameType}</td>
                      <td className="py-2 px-4 text-right text-gray-800">{formatTime(elapsed)}</td>
                      <td className="py-2 px-4 text-right text-gray-600 text-sm">
                        {extras.length > 0 ? extras.join(', ') : '-'}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-gray-800">{cost}Rs</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="text-right">
              <div className="mb-2">
                <span className="text-lg font-semibold text-gray-700">Total: </span>
                <span className="text-2xl font-bold text-gray-800">{invoice.total}Rs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceViewer

