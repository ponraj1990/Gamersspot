import { useState, useEffect } from 'react'
import { GAME_TYPES, loadPricing, savePricing } from '../utils/pricing'

const PricingConfig = ({ onClose }) => {
  const [pricing, setPricing] = useState(loadPricing())

  useEffect(() => {
    setPricing(loadPricing())
  }, [])

  const handlePriceChange = (gameType, dayType, value) => {
    const newPricing = {
      ...pricing,
      [gameType]: {
        ...pricing[gameType],
        [dayType]: parseFloat(value) || 0
      }
    }
    setPricing(newPricing)
    savePricing(newPricing)
  }

  const gameTypeLabels = {
    [GAME_TYPES.PLAYSTATION]: 'PS5 Console',
    [GAME_TYPES.STEERING_WHEEL]: 'Steering Wheel',
    [GAME_TYPES.SYSTEM]: 'System Game'
  }

  const getGameTypeColor = (gameType) => {
    if (gameType === GAME_TYPES.PLAYSTATION) return 'cyan'
    if (gameType === GAME_TYPES.STEERING_WHEEL) return 'purple'
    return 'pink'
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="gaming-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="p-6 border-b border-purple-500/20 flex justify-between items-center sticky top-0 glass-effect z-20">
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>PRICING CONFIG</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-purple-400 mt-1"></div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-400 text-2xl font-bold transition-all hover:scale-110"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-4">
            {Object.values(GAME_TYPES).map((gameType) => {
              const gameColor = getGameTypeColor(gameType)
              return (
                <div key={gameType} className={`gaming-card rounded-lg p-5 border-${gameColor}-500/30 relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-${gameColor}-500/5 rounded-full blur-2xl`}></div>
                  <div className="relative z-10">
                    <h3 className={`text-base font-bold text-${gameColor}-400 mb-4`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {gameTypeLabels[gameType]}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold text-${gameColor}-400 mb-2 uppercase tracking-wider`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          Monday - Friday (Rs/hour)
                        </label>
                        <input
                          type="number"
                          value={pricing[gameType]?.weekday || 0}
                          onChange={(e) => handlePriceChange(gameType, 'weekday', e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-900/50 border border-${gameColor}-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-${gameColor}-500/50 focus:border-${gameColor}-500 text-slate-200 font-bold text-base shadow-lg`}
                          style={{ fontFamily: 'Orbitron, sans-serif' }}
                          min="0"
                          step="1"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-xs font-semibold text-${gameColor}-400 mb-2 uppercase tracking-wider`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          Saturday - Sunday (Rs/hour)
                        </label>
                        <input
                          type="number"
                          value={pricing[gameType]?.weekend || 0}
                          onChange={(e) => handlePriceChange(gameType, 'weekend', e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-900/50 border border-${gameColor}-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-${gameColor}-500/50 focus:border-${gameColor}-500 text-slate-200 font-bold text-base shadow-lg`}
                          style={{ fontFamily: 'Orbitron, sans-serif' }}
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="pt-4 border-t border-purple-500/20">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg font-bold text-sm transition-all duration-200 shadow-lg shadow-purple-500/25"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                ✓ Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingConfig

