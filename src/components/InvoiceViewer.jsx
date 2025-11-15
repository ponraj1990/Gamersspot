import { useState } from 'react'
import { formatTime } from '../utils/timer'
import { calculateCost, calculatePaidHours, getRate, getExtraControllerRate, getBonusTime, getExtraTimePlayed, getCokeBottleRate, getCokeCanRate } from '../utils/pricing'
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-[95vw] w-full max-h-[95vh] overflow-y-auto border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-light text-gray-900 mb-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Invoice</h2>
            <p className="text-gray-500 text-sm font-light">Review and download invoice</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 disabled:transform-none"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              {isGenerating ? 'Generating...' : '📥 Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div id="invoice-content" className="p-12 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          {/* Header Section */}
          <div className="mb-12 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Gamers Spot</h1>
                <p className="text-gray-500 text-base font-light">Professional Game Zone</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs font-medium mb-1 tracking-wide uppercase">Invoice</p>
                <p className="text-gray-900 text-xl font-light" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{invoice.invoiceNumber}</p>
                <p className="text-gray-400 text-xs font-medium mt-4 mb-1 tracking-wide uppercase">Date</p>
                <p className="text-gray-600 text-base font-light">{invoiceDate}</p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-12">
            <h2 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Items</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-8 font-medium text-gray-600 text-sm tracking-wide">Station</th>
                    <th className="text-left py-4 px-8 font-medium text-gray-600 text-sm tracking-wide">Customer</th>
                    <th className="text-left py-4 px-8 font-medium text-gray-600 text-sm tracking-wide">Type</th>
                    <th className="text-right py-4 px-8 font-medium text-gray-600 text-sm tracking-wide">Time</th>
                    <th className="text-right py-4 px-8 font-medium text-gray-600 text-sm tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.stations.map((station, index) => {
                    const elapsed = station.elapsedTime || 0
                    const gameType = station.gameType || 'PlayStation'
                    const extraControllers = station.extraControllers || 0
                    const snacks = station.snacks || {}
                    const cokeBottleCount = snacks.cokeBottle || 0
                    const cokeCanCount = snacks.cokeCan || 0
                    const baseRate = getRate(gameType)
                    const paidHours = calculatePaidHours(elapsed, gameType)
                    const bonusTime = getBonusTime(elapsed, gameType)
                    const extraTimePlayed = getExtraTimePlayed(elapsed, gameType)
                    const baseCost = paidHours * baseRate
                    const extraControllerCost = extraControllers * getExtraControllerRate()
                    const snacksCost = (cokeBottleCount * getCokeBottleRate()) + (cokeCanCount * getCokeCanRate())
                    const totalCost = baseCost + extraControllerCost + snacksCost
                    
                    return (
                      <tr key={index} className={`border-b border-gray-100 ${index === invoice.stations.length - 1 ? '' : 'border-b'}`}>
                        <td className="py-5 px-8">
                          <div className="font-medium text-gray-900 text-base">{station.name}</div>
                        </td>
                        <td className="py-5 px-8">
                          <div className="font-light text-gray-600 text-base">{station.customerName || '-'}</div>
                        </td>
                        <td className="py-5 px-8">
                          <div className="font-light text-gray-600 text-base">{gameType}</div>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <div className="font-light text-gray-600 text-base">{formatTime(elapsed)}</div>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <div className="font-medium text-gray-900 text-base">{totalCost}Rs</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Breakdown Section */}
          <div className="mb-12">
            <h2 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Detailed Breakdown</h2>
            {invoice.stations.map((station, index) => {
              const elapsed = station.elapsedTime || 0
              const gameType = station.gameType || 'PlayStation'
              const extraControllers = station.extraControllers || 0
              const snacks = station.snacks || {}
              const cokeBottleCount = snacks.cokeBottle || 0
              const cokeCanCount = snacks.cokeCan || 0
              const baseRate = getRate(gameType)
              const paidHours = calculatePaidHours(elapsed, gameType)
              const bonusTime = getBonusTime(elapsed, gameType)
              const extraTimePlayed = getExtraTimePlayed(elapsed, gameType)
              const baseCost = paidHours * baseRate
              const extraControllerCost = extraControllers * getExtraControllerRate()
              const snacksCost = (cokeBottleCount * getCokeBottleRate()) + (cokeCanCount * getCokeCanRate())
              const totalCost = baseCost + extraControllerCost + snacksCost

              return (
                <div key={index} className="mb-8 p-8 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{station.name}</h3>
                      <p className="text-gray-500 text-sm font-light">Customer: {station.customerName || 'N/A'}</p>
                      <p className="text-gray-500 text-sm font-light">Type: {gameType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs font-medium mb-1 tracking-wide uppercase">Total Time</p>
                      <p className="text-gray-900 font-light text-base">{formatTime(elapsed)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm mb-1">Base Cost</p>
                        <p className="text-xs text-gray-500 font-light">{paidHours}hr × {baseRate}Rs/hr</p>
                      </div>
                      <p className="font-medium text-gray-900 text-base">{baseCost}Rs</p>
                    </div>
                    
                    {bonusTime > 0 && (
                      <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-xl border border-green-100">
                        <div>
                          <p className="font-medium text-green-700 text-sm mb-1">Bonus Time</p>
                          <p className="text-xs text-green-600 font-light">{formatTime(bonusTime)} (Free)</p>
                        </div>
                        <p className="font-medium text-green-700 text-base">Free</p>
                      </div>
                    )}
                    
                    {extraTimePlayed > 0 && (
                      <div className="flex justify-between items-center py-3 bg-orange-50 px-4 rounded-xl border border-orange-100">
                        <div>
                          <p className="font-medium text-orange-700 text-sm mb-1">Extra Time</p>
                          <p className="text-xs text-orange-600 font-light">{formatTime(extraTimePlayed)} (Included)</p>
                        </div>
                        <p className="font-medium text-orange-700 text-base">Included</p>
                      </div>
                    )}
                    
                    {extraControllers > 0 && (
                      <div className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm mb-1">Extra Controllers</p>
                          <p className="text-xs text-gray-500 font-light">{extraControllers} × {getExtraControllerRate()}Rs</p>
                        </div>
                        <p className="font-medium text-gray-900 text-base">{extraControllerCost}Rs</p>
                      </div>
                    )}
                    
                    {snacksCost > 0 && (
                      <div className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm mb-1">Snacks</p>
                          <div className="text-xs text-gray-500 font-light">
                            {cokeBottleCount > 0 && <p>{cokeBottleCount} Bottle(s) × {getCokeBottleRate()}Rs</p>}
                            {cokeCanCount > 0 && <p>{cokeCanCount} Can(s) × {getCokeCanRate()}Rs</p>}
                          </div>
                        </div>
                        <p className="font-medium text-gray-900 text-base">{snacksCost}Rs</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-4 mt-6 pt-4 border-t border-gray-300">
                      <p className="font-medium text-gray-900 text-lg">Subtotal</p>
                      <p className="font-light text-gray-900 text-xl">{totalCost}Rs</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total Section */}
          <div className="flex justify-end pt-8 border-t border-gray-200">
            <div className="text-right">
              <p className="text-gray-400 text-sm font-medium mb-2 tracking-wide uppercase">Total Amount</p>
              <p className="text-4xl font-light text-gray-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{invoice.total}Rs</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-400 text-sm font-light">Thank you for choosing Gamers Spot</p>
            <p className="text-gray-300 text-xs font-light mt-2">Professional Game Zone Management System</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceViewer

