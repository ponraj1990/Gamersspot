import { useState, useEffect } from 'react'
import StationCard from './components/StationCard'
import BillingPanel from './components/BillingPanel'
import InvoiceViewer from './components/InvoiceViewer'
import PricingConfig from './components/PricingConfig'
import { loadStations, saveStations } from './utils/storage'
import { GAME_TYPES, calculateCost } from './utils/pricing'

function App() {
  const [stations, setStations] = useState([])
  const [invoice, setInvoice] = useState(null)
  const [showPricingConfig, setShowPricingConfig] = useState(false)

  useEffect(() => {
    const savedStations = loadStations()
    if (savedStations.length > 0) {
      setStations(savedStations)
    } else {
      const ps5Stations = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `PS5 Station ${i + 1}`,
        gameType: GAME_TYPES.PLAYSTATION,
        elapsedTime: 0,
        isRunning: false,
        extraControllers: 0,
        snacks: { cokeBottle: 0, cokeCan: 0 },
        customerName: '',
      }))
      
      const steeringWheelStation = {
        id: 6,
        name: 'Steering Wheel',
        gameType: GAME_TYPES.STEERING_WHEEL,
        elapsedTime: 0,
        isRunning: false,
        extraControllers: 0,
        snacks: { cokeBottle: 0, cokeCan: 0 },
        customerName: '',
      }
      
      const systemStation = {
        id: 7,
        name: 'System Game',
        gameType: GAME_TYPES.SYSTEM,
        elapsedTime: 0,
        isRunning: false,
        extraControllers: 0,
        snacks: { cokeBottle: 0, cokeCan: 0 },
        customerName: '',
      }
      
      setStations([...ps5Stations, steeringWheelStation, systemStation])
    }
  }, [])

  useEffect(() => {
    if (stations.length > 0) {
      saveStations(stations)
    }
  }, [stations])

  const handleStationUpdate = (updatedStation) => {
    setStations((prev) =>
      prev.map((s) => (s.id === updatedStation.id ? updatedStation : s))
    )
  }

  const handleStationDelete = (stationId) => {
    // Prevent deletion of default 7 game slots (IDs 1-7)
    if (stationId >= 1 && stationId <= 7) {
      alert('Cannot delete default game slots. These are required for the gaming zone.')
      return
    }
    setStations((prev) => prev.filter((s) => s.id !== stationId))
  }

  const handleAddStation = (gameType = GAME_TYPES.PLAYSTATION) => {
    const newId = Math.max(...stations.map((s) => s.id), 0) + 1
    const existingCount = stations.filter(s => s.gameType === gameType).length
    
    let name
    if (gameType === GAME_TYPES.PLAYSTATION) {
      name = `PS5 Station ${existingCount + 1}`
    } else if (gameType === GAME_TYPES.STEERING_WHEEL) {
      name = `Steering Wheel ${existingCount + 1}`
    } else {
      name = `System Game ${existingCount + 1}`
    }
    
    const newStation = {
      id: newId,
      name,
      gameType,
      elapsedTime: 0,
      isRunning: false,
      extraControllers: 0,
      snacks: { cokeBottle: 0, cokeCan: 0 },
      customerName: '',
    }
    setStations((prev) => [...prev, newStation])
  }

  const handleResetAll = () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure? Do you want to reset all timers?')
    if (!confirmed) {
      return // User cancelled, don't reset
    }
    
    setStations((prev) =>
      prev.map((station) => {
        // Don't reset stations that are marked as done
        if (station.isDone) {
          return station
        }
        // Reset only non-done stations (timer, running state, extra controllers, snacks, and customer name)
        return {
          ...station,
          elapsedTime: 0,
          isRunning: false,
          isDone: false,
          extraControllers: 0,
          snacks: { cokeBottle: 0, cokeCan: 0 },
          customerName: '',
        }
      })
    )
  }

  const handleGenerateInvoice = (invoiceStations, total) => {
    const invoiceNumber = `INV-${Date.now()}`
    setInvoice({
      invoiceNumber,
      stations: invoiceStations,
      total,
      date: new Date().toISOString(),
    })
  }

  const getCurrentDateAndDay = () => {
    const now = new Date()
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const dayName = days[now.getDay()]
    const date = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    
    return {
      day: dayName,
      date: `${month} ${date}, ${year}`
    }
  }

  const { day, date } = getCurrentDateAndDay()

  const activeStations = stations.filter(s => s.isRunning).length
  const totalRevenue = stations
    .filter(s => s.isDone && s.elapsedTime > 0)
    .reduce((sum, s) => {
      const gameType = s.gameType || GAME_TYPES.PLAYSTATION
      return sum + calculateCost(s.elapsedTime, gameType, s.extraControllers || 0, s.snacks || {})
    }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="glass-effect sticky top-0 z-50 border-b border-purple-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                GAMERS SPOT
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Gaming Zone for professional players
              </p>
              <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-purple-400 mt-1"></div>
            </div>
            <div className="text-right bg-slate-800/50 px-4 py-2 rounded-lg border border-purple-500/30 neon-purple">
              <div className="text-sm font-semibold text-cyan-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{day}</div>
              <div className="text-xs font-medium text-slate-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{date}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="gaming-card rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active Sessions</p>
              <p className="text-3xl font-bold text-cyan-400 neon-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>{activeStations}</p>
            </div>
          </div>
          
          <div className="gaming-card rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>PS5 Stations</p>
              <p className="text-3xl font-bold text-purple-400 neon-purple" style={{ fontFamily: 'Orbitron, sans-serif' }}>{stations.filter(s => s.gameType === GAME_TYPES.PLAYSTATION).length}</p>
            </div>
          </div>
          
          <div className="gaming-card rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Stations</p>
              <p className="text-3xl font-bold text-pink-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>{stations.length}</p>
            </div>
          </div>
          
          <div className="gaming-card rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Revenue</p>
              <p className="text-2xl font-bold text-green-400 neon-green" style={{ fontFamily: 'Orbitron, sans-serif' }}>{totalRevenue}Rs</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <span className="text-slate-400">PS5: <span className="text-cyan-400">{stations.filter(s => s.gameType === GAME_TYPES.PLAYSTATION).length}</span></span>
            <span className="text-purple-500/50">|</span>
            <span className="text-slate-400">Wheel: <span className="text-purple-400">{stations.filter(s => s.gameType === GAME_TYPES.STEERING_WHEEL).length}</span></span>
            <span className="text-purple-500/50">|</span>
            <span className="text-slate-400">System: <span className="text-pink-400">{stations.filter(s => s.gameType === GAME_TYPES.SYSTEM).length}</span></span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowPricingConfig(true)}
              className="px-4 py-2 bg-slate-800/50 text-cyan-400 rounded-lg hover:bg-slate-700/50 font-semibold text-sm transition-all border border-cyan-500/30 hover:border-cyan-500/50 neon-cyan"
              title="Configure pricing"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ⚙️ Pricing
            </button>
            <button
              onClick={handleResetAll}
              className="px-4 py-2 bg-slate-800/50 text-orange-400 rounded-lg hover:bg-slate-700/50 font-semibold text-sm transition-all border border-orange-500/30 hover:border-orange-500/50 neon-orange"
              title="Reset all timers"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ↻ Reset All
            </button>
            <button
              onClick={() => handleAddStation(GAME_TYPES.PLAYSTATION)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              + PS5
            </button>
            <button
              onClick={() => handleAddStation(GAME_TYPES.STEERING_WHEEL)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 font-bold text-sm transition-all shadow-lg shadow-purple-500/25"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              + Wheel
            </button>
            <button
              onClick={() => handleAddStation(GAME_TYPES.SYSTEM)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-400 hover:to-rose-400 font-bold text-sm transition-all shadow-lg shadow-pink-500/25"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              + System
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {stations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onUpdate={handleStationUpdate}
                  onDelete={handleStationDelete}
                />
              ))}
            </div>
            {stations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No stations yet. Add one to get started.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <BillingPanel
              stations={stations}
              onGenerateInvoice={handleGenerateInvoice}
            />
          </div>
        </div>
      </main>

      {invoice && (
        <InvoiceViewer
          invoice={invoice}
          onClose={() => setInvoice(null)}
        />
      )}

      {showPricingConfig && (
        <PricingConfig
          onClose={() => setShowPricingConfig(false)}
        />
      )}
    </div>
  )
}

export default App

