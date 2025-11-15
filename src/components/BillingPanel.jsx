import { useState } from 'react'
import { formatTime } from '../utils/timer'
import { calculateCost } from '../utils/pricing'

const BillingPanel = ({ stations, onGenerateInvoice }) => {
  const [selectedStations, setSelectedStations] = useState([])

  const toggleStation = (stationId) => {
    setSelectedStations((prev) =>
      prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId]
    )
  }

  const getTotalCost = () => {
    return selectedStations.reduce((total, stationId) => {
      const station = stations.find((s) => s.id === stationId)
      if (!station) return total
      const elapsed = station.elapsedTime || 0
      const gameType = station.gameType || 'PlayStation'
      return total + calculateCost(
        elapsed,
        gameType,
        station.hasExtraController || false,
        station.hasSteeringWheel || false
      )
    }, 0)
  }

  const handleGenerateInvoice = () => {
    const invoiceStations = stations.filter((s) => selectedStations.includes(s.id))
    onGenerateInvoice(invoiceStations, getTotalCost())
    setSelectedStations([])
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-gray-200 sticky top-4">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Billing</h2>
      
      <div className="mb-3 p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg text-xs border border-yellow-200">
        <div className="font-semibold text-gray-700 mb-1">Pricing:</div>
        <div className="text-gray-600 space-y-0.5">
          <div>PS5: {new Date().getDay() === 0 || new Date().getDay() === 6 ? '200Rs' : '150Rs'}/hr</div>
          <div>Desktop: 100Rs/hr</div>
        </div>
      </div>

      <div className="space-y-1.5 mb-3 max-h-80 overflow-y-auto">
        {stations.map((station) => {
          const elapsed = station.elapsedTime || 0
          const gameType = station.gameType || 'PlayStation'
          const cost = calculateCost(
            elapsed,
            gameType,
            station.hasExtraController || false,
            station.hasSteeringWheel || false
          )
          const isSelected = selectedStations.includes(station.id)

          return (
            <label
              key={station.id}
              className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStation(station.id)}
                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-gray-800 truncate">{station.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatTime(elapsed)}
                  </div>
                </div>
              </div>
              <div className="font-bold text-sm text-gray-800 ml-2">{cost}Rs</div>
            </label>
          )
        })}
      </div>

      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex justify-between items-center mb-3 bg-gradient-to-r from-blue-50 to-blue-100 p-2 rounded-lg">
          <span className="text-base font-bold text-gray-700">Total:</span>
          <span className="text-xl font-bold text-gray-800">
            {getTotalCost()}Rs
          </span>
        </div>
        <button
          onClick={handleGenerateInvoice}
          disabled={selectedStations.length === 0}
          className="w-full px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed font-semibold text-sm shadow-md transition-all"
        >
          📄 Generate Invoice
        </button>
      </div>
    </div>
  )
}

export default BillingPanel

