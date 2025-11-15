import { useState, useEffect, useRef } from 'react'
import { formatTime } from '../utils/timer'
import { calculateCost, getRate, GAME_TYPES, getDayType, calculatePaidHours, getExtraControllerRate, getBonusTime, getExtraTimePlayed, getCokeBottleRate, getCokeCanRate } from '../utils/pricing'

const BillingPanel = ({ stations, onGenerateInvoice }) => {
  const [selectedStations, setSelectedStations] = useState([])
  const [highlightedStations, setHighlightedStations] = useState([])
  const [discount, setDiscount] = useState(0)
  const previousDoneStations = useRef(new Set())
  
  // Auto-select stations when they are marked as done
  useEffect(() => {
    const doneStations = stations
      .filter(s => s.isDone === true && (s.elapsedTime || 0) > 0)
      .map(s => s.id)
    
    const currentDoneSet = new Set(doneStations)
    const previousDoneSet = previousDoneStations.current
    
    // Find newly done stations
    const newlyDone = doneStations.filter(id => !previousDoneSet.has(id))
    
    if (newlyDone.length > 0) {
      // Automatically select newly done stations
      setSelectedStations(prev => {
        const newSelection = [...new Set([...prev, ...newlyDone])]
        return newSelection
      })
      
      // Highlight them with animation
      setHighlightedStations(newlyDone)
      
      // Scroll to the first newly done station
      setTimeout(() => {
        const firstNewStationId = newlyDone[0]
        const stationElement = document.getElementById(`billing-station-${firstNewStationId}`)
        if (stationElement) {
          stationElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
      
      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedStations([])
      }, 2000)
    }
    
    // Update previous done stations
    previousDoneStations.current = currentDoneSet
  }, [stations])

  const toggleStation = (stationId) => {
    setSelectedStations((prev) =>
      prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId]
    )
  }

  const getSubtotal = () => {
    return selectedStations.reduce((total, stationId) => {
      const station = stations.find((s) => s.id === stationId)
      if (!station) return total
      const elapsed = station.elapsedTime || 0
      const gameType = station.gameType || 'PlayStation'
      return total + calculateCost(
        elapsed,
        gameType,
        station.extraControllers || 0,
        station.snacks || {}
      )
    }, 0)
  }

  const getTotalCost = () => {
    const subtotal = getSubtotal()
    const discountAmount = parseFloat(discount) || 0
    return Math.max(0, subtotal - discountAmount)
  }

  const handleGenerateInvoice = () => {
    const invoiceStations = stations.filter((s) => selectedStations.includes(s.id))
    onGenerateInvoice(invoiceStations, getTotalCost(), parseFloat(discount) || 0)
    setSelectedStations([])
    setDiscount(0)
  }

  return (
    <div className="gaming-card rounded-xl p-5 sticky top-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="relative z-10">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>BILLING</h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-400 to-purple-400 mt-1"></div>
        </div>
        
        <div className="mb-5 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
          <div className="font-semibold text-purple-400 mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Pricing ({getDayType() === 'weekend' ? 'Weekend' : 'Weekday'})</div>
          <div className="space-y-1.5 text-xs font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <div className="flex justify-between text-slate-300">
              <span className="text-cyan-400">PS5:</span>
              <span className="text-cyan-400">{getRate(GAME_TYPES.PLAYSTATION)}Rs/hr</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-purple-400">Wheel:</span>
              <span className="text-purple-400">{getRate(GAME_TYPES.STEERING_WHEEL)}Rs/hr</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-pink-400">System:</span>
              <span className="text-pink-400">{getRate(GAME_TYPES.SYSTEM)}Rs/hr</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-3 max-h-80 overflow-y-auto">
          {stations.filter(station => (station.isDone === true) && (station.elapsedTime || 0) > 0).length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              No completed sessions yet.<br />
              Click "Done" on a station to add it here.
            </div>
          ) : (
          stations
            .filter(station => (station.isDone === true) && (station.elapsedTime || 0) > 0) // Only show done stations with time
            .map((station) => {
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
          const isSelected = selectedStations.includes(station.id)

          const isHighlighted = highlightedStations.includes(station.id)
          
          return (
            <div
              id={`billing-station-${station.id}`}
              key={station.id}
              className={`gaming-card rounded-lg cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'border-orange-500/50 bg-orange-500/10 neon-orange' 
                  : isHighlighted
                  ? 'border-orange-400/50 bg-orange-500/10 ring-2 ring-orange-400/30 pulse-glow'
                  : 'border-purple-500/20 hover:border-purple-500/40'
              }`}
              style={{
                animation: isHighlighted ? 'pulse 0.5s ease-in-out 2' : 'none'
              }}
            >
              <label className="flex items-center gap-2 p-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStation(station.id)}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 focus:ring-2 flex-shrink-0 bg-white border-gray-300"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="font-bold text-sm text-cyan-400 truncate" style={{ fontFamily: 'Orbitron, sans-serif' }}>{station.name}</div>
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider border border-orange-500/30" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Done</span>
                  </div>
                  {station.customerName && (
                    <div className="text-xs text-slate-400 font-semibold mt-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      👤 {station.customerName}
                      {station.startTime && (
                        <span className="ml-2 text-cyan-300">
                          🕐 {station.startTime}
                        </span>
                      )}
                      {station.endTime && (
                        <span className="ml-2 text-orange-300">
                          🕐 {station.endTime}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {formatTime(elapsed)}
                  </div>
                </div>
                <div className="font-bold text-sm text-green-400 neon-green ml-2" style={{ 
                  fontFamily: 'Orbitron, sans-serif'
                }}>{totalCost}Rs</div>
              </label>
              
              {/* Detailed Billing Breakdown */}
              <div className="px-3 pb-3 pt-2 border-t border-slate-700/50 bg-slate-800/30 rounded-b-lg">
                <div className="text-xs space-y-1.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  <div className="flex justify-between text-slate-400">
                    <span className="font-semibold text-[10px]">Base ({paidHours}hr × {baseRate}Rs):</span>
                    <span className="font-bold text-cyan-400">{baseCost}Rs</span>
                  </div>
                  {bonusTime > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span className="font-semibold text-[10px]">Bonus Time ({formatTime(bonusTime)}):</span>
                      <span className="font-bold neon-green">Free</span>
                    </div>
                  )}
                  {extraTimePlayed > 0 && (
                    <div className="flex justify-between text-orange-400">
                      <span className="font-semibold text-[10px]">Extra Time ({formatTime(extraTimePlayed)}):</span>
                      <span className="font-bold neon-orange">Included</span>
                    </div>
                  )}
                  {extraControllers > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span className="font-semibold text-[10px]">Extra Controllers ({extraControllers} × {getExtraControllerRate()}Rs):</span>
                      <span className="font-bold text-purple-400">{extraControllerCost}Rs</span>
                    </div>
                  )}
                  {snacksCost > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span className="font-semibold text-[10px]">
                        Snacks: {cokeBottleCount > 0 && `${cokeBottleCount} Bottle${cokeBottleCount > 1 ? 's' : ''}`}{cokeBottleCount > 0 && cokeCanCount > 0 && ', '}{cokeCanCount > 0 && `${cokeCanCount} Can${cokeCanCount > 1 ? 's' : ''}`}
                      </span>
                      <span className="font-bold text-pink-400">{snacksCost}Rs</span>
                    </div>
                  )}
                  <div className="flex justify-between text-green-400 font-bold pt-1.5 border-t border-slate-700/50">
                    <span className="text-[10px]">Total:</span>
                    <span className="text-sm neon-green">{totalCost}Rs</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })
        )}
      </div>

        <div className="border-t border-slate-700/50 pt-5 mt-5">
          <div className="space-y-3 mb-5">
            <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-purple-500/20">
              <span className="text-sm font-semibold text-slate-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Subtotal:</span>
              <span className="text-xl font-bold text-slate-300" style={{ 
                fontFamily: 'Orbitron, sans-serif'
              }}>
                {getSubtotal()}Rs
              </span>
            </div>
            
            <div className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/20">
              <label className="block text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                💰 Discount / Adjustment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 bg-slate-900/70 border border-purple-500/30 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 font-semibold text-sm transition-all"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                />
                <span className="text-sm font-semibold text-slate-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Rs</span>
              </div>
              {discount > 0 && (
                <div className="mt-2 text-xs text-orange-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  -{parseFloat(discount) || 0}Rs discount applied
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-green-500/30">
              <span className="text-sm font-semibold text-slate-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Final Total:</span>
              <span className="text-3xl font-bold text-green-400 neon-green" style={{ 
                fontFamily: 'Orbitron, sans-serif'
              }}>
                {getTotalCost()}Rs
              </span>
            </div>
          </div>
          <button
            onClick={handleGenerateInvoice}
            disabled={selectedStations.length === 0}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-all duration-200 shadow-lg shadow-purple-500/25"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            📄 Generate Invoice
          </button>
        </div>
      </div>
    </div>
  )
}

export default BillingPanel

