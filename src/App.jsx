import { useState, useEffect, useRef } from 'react'
import StationCard from './components/StationCard'
import BillingPanel from './components/BillingPanel'
import InvoiceViewer from './components/InvoiceViewer'
import PricingConfig from './components/PricingConfig'
import Reports from './components/Reports'
import { loadStations, saveStations } from './utils/storage'
import { invoicesAPI } from './utils/api'
import { GAME_TYPES, calculateCost } from './utils/pricing'

function App() {
  const [stations, setStations] = useState([])
  const [invoice, setInvoice] = useState(null)
  const [showPricingConfig, setShowPricingConfig] = useState(false)
  const [showReports, setShowReports] = useState(false)

  // Helper function to create default stations
  const createDefaultStations = () => {
    const ps5Stations = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `PS5 Station ${i + 1}`,
      gameType: GAME_TYPES.PLAYSTATION,
      elapsedTime: 0,
      isRunning: false,
      isDone: false,
      extraControllers: 0,
      snacks: { cokeBottle: 0, cokeCan: 0 },
      customerName: '',
      startTime: null,
      endTime: null,
    }))
    
    const steeringWheelStation = {
      id: 6,
      name: 'Steering Wheel',
      gameType: GAME_TYPES.STEERING_WHEEL,
      elapsedTime: 0,
      isRunning: false,
      isDone: false,
      extraControllers: 0,
      snacks: { cokeBottle: 0, cokeCan: 0 },
      customerName: '',
      startTime: null,
      endTime: null,
    }
    
    const systemStation = {
      id: 7,
      name: 'System Game',
      gameType: GAME_TYPES.SYSTEM,
      elapsedTime: 0,
      isRunning: false,
      isDone: false,
      extraControllers: 0,
      snacks: { cokeBottle: 0, cokeCan: 0 },
      customerName: '',
      startTime: null,
      endTime: null,
    }
    
    return [...ps5Stations, steeringWheelStation, systemStation]
  }

  // Recalculate elapsed time for running timers based on startTime and current time
  const recalculateElapsedTime = (stations) => {
    const now = Date.now()
    const today = new Date()
    let hasUpdates = false
    
    const updatedStations = stations.map(station => {
      // If timer is running and has a startTime, recalculate elapsed time from startTime
      if (station.isRunning && station.startTime && !station.isDone) {
        try {
          const timeString = station.startTime
          
          // Parse startTime string (format: "07:30 AM" or "7:30 AM")
          const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
          
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10)
            const minutes = parseInt(timeMatch[2], 10)
            const ampm = timeMatch[3]?.toUpperCase()
            
            // Convert to 24-hour format
            if (ampm === 'PM' && hours !== 12) {
              hours += 12
            } else if (ampm === 'AM' && hours === 12) {
              hours = 0
            }
            
            // Create a date for today with the parsed start time
            const startDate = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              hours,
              minutes,
              0,
              0
            )
            
            // If the parsed time is in the future, it means the timer started yesterday
            // (e.g., if current time is 1:00 AM and startTime is 11:00 PM)
            if (startDate.getTime() > now) {
              startDate.setDate(startDate.getDate() - 1)
            }
            
            // Calculate elapsed time in seconds from start to now
            const elapsedSinceStart = Math.floor((now - startDate.getTime()) / 1000)
            
            // Only update if the calculated time is different and makes sense
            // (should be >= current elapsedTime since time only moves forward)
            if (elapsedSinceStart >= 0 && elapsedSinceStart !== station.elapsedTime) {
              hasUpdates = true
              console.log(`Recalculating elapsed time for ${station.name}: ${station.elapsedTime}s -> ${elapsedSinceStart}s (started at ${timeString})`)
              return {
                ...station,
                elapsedTime: elapsedSinceStart
              }
            }
          } else {
            console.warn(`Could not parse startTime for station ${station.id}: ${timeString}`)
          }
        } catch (error) {
          console.error(`Error recalculating elapsed time for station ${station.id}:`, error)
        }
      }
      
      return station
    })
    
    return { stations: updatedStations, hasUpdates }
  }

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const savedStations = await loadStations()
        const defaultStations = createDefaultStations()
        
        // Always ensure default stations (IDs 1-7) exist
        const defaultStationIds = new Set(defaultStations.map(s => s.id))
        const existingStationIds = new Set(savedStations.map(s => s.id))
        
        // Find missing default stations
        const missingStations = defaultStations.filter(s => !existingStationIds.has(s.id))
        
        // Get non-default stations (IDs > 7) to preserve them
        const nonDefaultStations = savedStations.filter(s => !defaultStationIds.has(s.id))
        
        if (savedStations.length === 0 || missingStations.length > 0) {
          // No stations or missing default stations - ensure all defaults exist
          const allStations = [...defaultStations, ...nonDefaultStations].sort((a, b) => a.id - b.id)
          setStations(allStations)
          try {
            await saveStations(allStations)
            if (missingStations.length > 0) {
              console.log(`Added ${missingStations.length} missing default stations to database`)
            } else {
              console.log('Default stations created and saved to database')
            }
          } catch (saveError) {
            console.error('Error saving stations to database:', saveError)
          }
        } else {
          // All default stations exist - recalculate elapsed time for running timers
          const { stations: recalculatedStations, hasUpdates } = recalculateElapsedTime(savedStations)
          
          setStations(recalculatedStations)
          
          // If elapsed time was recalculated, save to database
          if (hasUpdates) {
            try {
              await saveStations(recalculatedStations)
              console.log('Recalculated and updated elapsed time for running timers')
            } catch (saveError) {
              console.error('Error saving recalculated elapsed time:', saveError)
            }
          }
        }
      } catch (error) {
        console.error('Error loading stations:', error)
        // Fallback to default stations
        const defaultStations = createDefaultStations()
        setStations(defaultStations)
        // Try to save default stations to database
        try {
          await saveStations(defaultStations)
          console.log('Default stations created and saved to database (fallback)')
        } catch (saveError) {
          console.error('Error saving default stations to database:', saveError)
        }
      }
    }
    
    fetchStations()
  }, [])

  // Throttle database saves to once per minute to reduce connection timeouts
  const lastSaveTimeRef = useRef(0)
  const saveTimeoutRef = useRef(null)
  const pendingStationsRef = useRef(null)
  const prevStationsRef = useRef([])
  
  useEffect(() => {
    if (stations.length > 0) {
      const now = Date.now()
      const timeSinceLastSave = now - lastSaveTimeRef.current
      const SAVE_INTERVAL = 60000 // 1 minute in milliseconds
      
      // Check if this is a critical update (start/stop/done/customer name) that needs immediate save
      const prevStations = prevStationsRef.current
      const hasCriticalChange = stations.some((station, index) => {
        const prevStation = prevStations[index]
        if (!prevStation) return true // New station, save immediately
        
        // Critical changes that need immediate save:
        // - isRunning changed (start/stop)
        // - isDone changed
        // - customerName changed
        // - startTime changed (timer started)
        // - endTime changed (timer stopped)
        return (
          prevStation.isRunning !== station.isRunning ||
          prevStation.isDone !== station.isDone ||
          (prevStation.customerName || '') !== (station.customerName || '') ||
          prevStation.startTime !== station.startTime ||
          prevStation.endTime !== station.endTime ||
          prevStation.extraControllers !== station.extraControllers ||
          JSON.stringify(prevStation.snacks || {}) !== JSON.stringify(station.snacks || {})
        )
      })
      
      // Store the latest stations state
      pendingStationsRef.current = stations
      
      // Clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      // If critical change or enough time has passed, save immediately
      if (hasCriticalChange || timeSinceLastSave >= SAVE_INTERVAL) {
        lastSaveTimeRef.current = now
        saveStations(stations).catch(error => {
          console.error('Error saving stations:', error)
        })
        prevStationsRef.current = stations.map(s => ({ ...s })) // Deep copy for comparison
      } else {
        // Schedule a save after the remaining time (for elapsed time updates)
        const remainingTime = SAVE_INTERVAL - timeSinceLastSave
        saveTimeoutRef.current = setTimeout(() => {
          if (pendingStationsRef.current) {
            lastSaveTimeRef.current = Date.now()
            saveStations(pendingStationsRef.current).catch(error => {
              console.error('Error saving stations:', error)
            })
            prevStationsRef.current = pendingStationsRef.current.map(s => ({ ...s }))
            pendingStationsRef.current = null
          }
        }, remainingTime)
      }
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [stations])

  const handleStationUpdate = (updatedStation) => {
    setStations((prev) =>
      prev.map((s) => (s.id === updatedStation.id ? updatedStation : s))
    )
  }

  const handleInvoicePaid = async (invoiceStations) => {
    // Reset all stations that were in the invoice
    // Use functional setState to ensure we get the latest state
    let updatedStations = null
    
    setStations((prev) => {
      updatedStations = prev.map((station) => {
        const invoiceStation = invoiceStations.find((is) => is.id === station.id)
        if (invoiceStation) {
          // Reset this station completely
          return {
            ...station,
            elapsedTime: 0,
            isRunning: false,
            isDone: false,
            extraControllers: 0,
            snacks: { cokeBottle: 0, cokeCan: 0 },
            customerName: '',
            startTime: null,
            endTime: null,
          }
        }
        return station
      })
      
      // Update prevStationsRef to mark this as a critical change
      prevStationsRef.current = updatedStations.map(s => ({ ...s }))
      
      return updatedStations
    })
    
    // Save immediately to database (bypass throttling)
    // Clear any pending save timeout first
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    
    try {
      // Save the reset stations immediately
      if (updatedStations) {
        await saveStations(updatedStations)
        console.log('Stations reset and saved to database after payment')
        
        // Reset the save timer to prevent immediate re-save
        lastSaveTimeRef.current = Date.now()
      }
    } catch (error) {
      console.error('Error saving reset stations to database:', error)
      // Still update local state even if save fails
    }
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

  const handleGenerateInvoice = async (invoiceStations, total, discount = 0) => {
    const invoiceNumber = `INV-${Date.now()}`
    const subtotal = invoiceStations.reduce((sum, station) => {
      const elapsed = station.elapsedTime || 0
      const gameType = station.gameType || GAME_TYPES.PLAYSTATION
      return sum + calculateCost(elapsed, gameType, station.extraControllers || 0, station.snacks || {})
    }, 0)
    
    // Debug: Log invoice stations to verify customerName is included
    console.log('Generating invoice with stations:', invoiceStations)
    invoiceStations.forEach((station, index) => {
      console.log(`Invoice Station ${index}:`, {
        id: station.id,
        name: station.name,
        customerName: station.customerName,
        allKeys: Object.keys(station)
      })
    })
    
    const invoice = {
      invoiceNumber,
      stations: invoiceStations,
      subtotal,
      discount: discount || 0,
      total,
      date: new Date().toISOString(),
    }
    
    // Save invoice to database
    try {
      await invoicesAPI.create({
        invoiceNumber,
        stations: invoiceStations,
        subtotal,
        discount: discount || 0,
        total,
      })
    } catch (error) {
      console.error('Failed to save invoice to database:', error)
      // Continue anyway to show the invoice
    }
    
    setInvoice(invoice)
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
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                GAMERS SPOT
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Gaming Zone for professional players
              </p>
              <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-cyan-400 to-purple-400 mt-1"></div>
            </div>
            <div className="text-right bg-slate-800/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-purple-500/30 neon-purple shrink-0">
              <div className="text-xs sm:text-sm font-semibold text-cyan-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{day}</div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{date}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
              <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Completed Sessions</p>
              <p className="text-3xl font-bold text-purple-400 neon-purple" style={{ fontFamily: 'Orbitron, sans-serif' }}>{stations.filter(s => s.isDone === true && (s.elapsedTime || 0) > 0).length}</p>
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

        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold flex-wrap" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <span className="text-slate-400">PS5: <span className="text-cyan-400">{stations.filter(s => s.gameType === GAME_TYPES.PLAYSTATION).length}</span></span>
            <span className="text-purple-500/50 hidden sm:inline">|</span>
            <span className="text-slate-400">Wheel: <span className="text-purple-400">{stations.filter(s => s.gameType === GAME_TYPES.STEERING_WHEEL).length}</span></span>
            <span className="text-purple-500/50 hidden sm:inline">|</span>
            <span className="text-slate-400">System: <span className="text-pink-400">{stations.filter(s => s.gameType === GAME_TYPES.SYSTEM).length}</span></span>
          </div>
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => setShowReports(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800/50 text-purple-400 rounded-lg hover:bg-slate-700/50 font-semibold text-xs sm:text-sm transition-all border border-purple-500/30 hover:border-purple-500/50 neon-purple flex-1 sm:flex-none"
              title="View reports and analytics"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              📊 Reports
            </button>
            <button
              onClick={() => setShowPricingConfig(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800/50 text-cyan-400 rounded-lg hover:bg-slate-700/50 font-semibold text-xs sm:text-sm transition-all border border-cyan-500/30 hover:border-cyan-500/50 neon-cyan flex-1 sm:flex-none"
              title="Configure pricing"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ⚙️ Pricing
            </button>
            <button
              onClick={handleResetAll}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800/50 text-orange-400 rounded-lg hover:bg-slate-700/50 font-semibold text-xs sm:text-sm transition-all border border-orange-500/30 hover:border-orange-500/50 neon-orange flex-1 sm:flex-none"
              title="Reset all timers"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ↻ Reset All
            </button>
            <button
              onClick={() => handleAddStation(GAME_TYPES.PLAYSTATION)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 flex-1 sm:flex-none"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              + PS5
            </button>
            <button
              onClick={() => handleAddStation(GAME_TYPES.STEERING_WHEEL)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-purple-500/25 flex-1 sm:flex-none"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              + Wheel
            </button>
            <button
              onClick={() => handleAddStation(GAME_TYPES.SYSTEM)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-400 hover:to-rose-400 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-pink-500/25 flex-1 sm:flex-none"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              + System
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
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

          <div className="lg:col-span-1 order-1 lg:order-2">
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
          onPaid={handleInvoicePaid}
        />
      )}

      {showPricingConfig && (
        <PricingConfig
          onClose={() => setShowPricingConfig(false)}
        />
      )}

      {showReports && (
        <Reports
          onClose={() => setShowReports(false)}
        />
      )}
    </div>
  )
}

export default App

