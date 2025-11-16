import { useState } from 'react'
import { formatTime } from '../utils/timer'
import { calculateCost, calculatePaidHours, getRate, getExtraControllerRate, getBonusTime, getExtraTimePlayed, getCokeBottleRate, getCokeCanRate } from '../utils/pricing'
import { generateInvoicePDF } from '../utils/pdf'

const InvoiceViewer = ({ invoice, onClose, onPaid }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  if (!invoice) return null

  const handlePaid = () => {
    if (onPaid) {
      onPaid(invoice.stations)
    }
    onClose()
  }

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-1 sm:p-2">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-[95vw] sm:max-w-[900px] w-full h-[98vh] sm:h-[97vh] overflow-hidden border border-gray-200 flex flex-col">
        <div className="p-2 sm:p-3 border-b border-gray-200 flex justify-between items-center bg-white flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-light text-gray-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Invoice</h2>
            <p className="text-gray-500 text-[10px] font-light hidden sm:block">Review and download invoice</p>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg sm:rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 disabled:transform-none"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              {isGenerating ? 'Generating...' : '📥 PDF'}
            </button>
            <button
              onClick={handlePaid}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              ✅ Paid
            </button>
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 font-medium text-xs sm:text-sm transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              ✕
            </button>
          </div>
        </div>

        <div id="invoice-content" className="p-4 sm:p-6 bg-white overflow-hidden flex-1 flex flex-col min-h-0" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          {/* Header Section */}
          <div className="mb-6 pb-6 border-b-2 border-gray-300 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.5px' }}>Gamers Spot</h1>
                <p className="text-gray-600 text-sm font-medium">Professional Game Zone</p>
              </div>
              <div className="text-left bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 min-w-[250px]">
                <p className="text-gray-900 text-sm font-bold mb-3 whitespace-nowrap" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  <span className="text-gray-500 text-xs font-semibold tracking-wider uppercase inline-block w-20">Invoice #</span>
                  <span className="ml-2">{invoice.invoiceNumber}</span>
                </p>
                <p className="text-gray-700 text-sm font-medium whitespace-nowrap">
                  <span className="text-gray-500 text-xs font-semibold tracking-wider uppercase inline-block w-20">Date</span>
                  <span className="ml-2">{invoiceDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6 flex-shrink-0 max-w-3xl mx-auto">
            <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs tracking-wider uppercase">Station</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs tracking-wider uppercase">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs tracking-wider uppercase">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs tracking-wider uppercase">Time Period</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 text-xs tracking-wider uppercase">Time Played</th>
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
                      <tr key={index} className={`border-b border-gray-200 ${index === invoice.stations.length - 1 ? '' : 'border-b'} hover:bg-gray-50 transition-colors`}>
                        <td className="py-3 px-4 align-top">
                          <div className="font-semibold text-gray-900 text-sm">{station.name}</div>
                        </td>
                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-gray-700 text-sm">{station.customerName || '-'}</div>
                        </td>
                        <td className="py-3 px-4 align-top">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded whitespace-nowrap">{gameType}</span>
                        </td>
                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-gray-700 text-xs">
                            {station.startTime && (
                              <div className="flex items-center gap-1 mb-1 whitespace-nowrap">
                                <span className="text-gray-500">🕐</span>
                                <span>{station.startTime}</span>
                              </div>
                            )}
                            {station.endTime && (
                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <span className="text-gray-500">🕐</span>
                                <span>{station.endTime}</span>
                              </div>
                            )}
                            {!station.startTime && !station.endTime && (
                              <div className="text-gray-400">-</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right align-top">
                          <div className="font-medium text-gray-700 text-sm whitespace-nowrap">{formatTime(elapsed)}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Breakdown Section */}
          <div className="pt-4 border-t-2 border-gray-300 flex-shrink-0">
            {invoice.stations.length <= 3 && (
              <div className="max-w-xl mx-auto">
                <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight text-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Detailed Breakdown</h2>
                <div className="space-y-2">
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
                      <div key={index} className="p-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-2 pb-1 border-b border-gray-300 text-center">{station.name}</h3>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-700 text-xs">Base: {paidHours}hr × {baseRate}Rs</p>
                            <p className="font-semibold text-gray-900 text-xs">{baseCost}Rs</p>
                          </div>
                          
                          {bonusTime > 0 && (
                            <div className="flex justify-between items-center bg-green-50 px-2 py-1.5 rounded border border-green-200">
                              <p className="font-medium text-green-700 text-xs">Bonus: {formatTime(bonusTime)}</p>
                              <p className="font-semibold text-green-700 text-xs">Free</p>
                            </div>
                          )}
                          
                          {extraControllers > 0 && (
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-gray-700 text-xs">Extra Controllers: {extraControllers} × {getExtraControllerRate()}Rs</p>
                              <p className="font-semibold text-gray-900 text-xs">{extraControllerCost}Rs</p>
                            </div>
                          )}
                          
                          {snacksCost > 0 && (
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-gray-700 text-xs">
                                Snacks: {cokeBottleCount > 0 && `${cokeBottleCount} Bottle(s)`}{cokeBottleCount > 0 && cokeCanCount > 0 && ' + '}{cokeCanCount > 0 && `${cokeCanCount} Can(s)`}
                              </p>
                              <p className="font-semibold text-gray-900 text-xs">{snacksCost}Rs</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t-2 border-gray-300">
                            <p className="font-bold text-gray-900 text-sm">Subtotal</p>
                            <p className="font-bold text-gray-900 text-sm">{totalCost}Rs</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300 text-center flex-shrink-0">
            <p className="text-gray-600 text-sm font-medium">Thank you for choosing Gamers Spot</p>
            <p className="text-gray-500 text-xs mt-1">Professional Game Zone Management System</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceViewer

