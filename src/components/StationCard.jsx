import { useState, useEffect, useRef } from 'react'
import TimerDisplay from './TimerDisplay'
import { formatTime } from '../utils/timer'
import { calculateCost, calculatePaidHours, getBonusTime, GAME_TYPES, getRate, getDayType, getCokeBottleRate, getCokeCanRate } from '../utils/pricing'
import { playAlarm } from '../utils/alarm'

const StationCard = ({ station, onUpdate, onDelete }) => {
  const [elapsedTime, setElapsedTime] = useState(station.elapsedTime || 0)
  const [isRunning, setIsRunning] = useState(station.isRunning || false)
  const [isDone, setIsDone] = useState(station.isDone || false)
  const [showNameInput, setShowNameInput] = useState(false)
  const [customerNameInput, setCustomerNameInput] = useState('')
  const [startTime, setStartTime] = useState(null)
  const nameInputRef = useRef(null)
  const intervalRef = useRef(null)
  const milestone1Hour = useRef(false)
  const milestone2Hours = useRef(false)
  const milestone3Hours = useRef(false)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1
          
          // Announce milestones for bonus time
          // Note: PS5 and Steering Wheel games only get bonus time on weekdays (Monday-Friday)
          const hours = newTime / 3600
          const gameType = station.gameType || GAME_TYPES.PLAYSTATION
          const dayType = getDayType()
          const isWeekendNoBonus = (gameType === GAME_TYPES.PLAYSTATION || gameType === GAME_TYPES.STEERING_WHEEL) && dayType === 'weekend'
          
          // 1 hour milestone (3600 seconds) - only announce bonus on weekdays for PS5 and Steering Wheel
          if (hours >= 1 && !milestone1Hour.current) {
            milestone1Hour.current = true
            if (isWeekendNoBonus) {
              const message = `${station.name} - 1 hour played`
              playAlarm(message, false)
            } else {
              const message = `${station.name} - 1 hour played, 15 minutes bonus time`
              playAlarm(message, false)
            }
          }
          
          // 2 hours milestone (7200 seconds) - only announce bonus on weekdays for PS5 and Steering Wheel
          if (hours >= 2 && !milestone2Hours.current) {
            milestone2Hours.current = true
            if (isWeekendNoBonus) {
              const message = `${station.name} - 2 hours played`
              playAlarm(message, false)
            } else {
              const message = `${station.name} - 2 hours played, 30 minutes bonus time`
              playAlarm(message, false)
            }
          }
          
          // 3 hours milestone (10800 seconds) - only announce bonus on weekdays for PS5 and Steering Wheel
          if (hours >= 3 && !milestone3Hours.current) {
            milestone3Hours.current = true
            if (isWeekendNoBonus) {
              const message = `${station.name} - 3 hours played`
              playAlarm(message, false)
            } else {
              const message = `${station.name} - 3 hours played, 1 hour bonus time`
              playAlarm(message, false)
            }
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, station.name])

  // Sync local state when station is reset from parent (only when explicitly reset via Reset All)
  useEffect(() => {
    // Sync isDone state from parent
    if (station.isDone !== undefined && station.isDone !== isDone) {
      setIsDone(station.isDone)
    }
    
    // Only sync reset if parent was explicitly reset: elapsedTime is 0, not running
    // AND station is NOT done (done stations should not be reset)
    // AND our local state doesn't match (we have time or are running)
    if (!station.isDone && station.elapsedTime === 0 && !station.isRunning && (elapsedTime > 0 || isRunning || isDone)) {
      setElapsedTime(0)
      setIsRunning(false)
      setIsDone(false)
      milestone1Hour.current = false
      milestone2Hours.current = false
      milestone3Hours.current = false
    }
  }, [station.elapsedTime, station.isRunning, station.isDone])

  useEffect(() => {
    // Only update if values actually changed to prevent loops
    if (station.elapsedTime !== elapsedTime || station.isRunning !== isRunning || station.isDone !== isDone) {
      onUpdate({
        ...station,
        elapsedTime,
        isRunning,
        isDone,
      })
    }
  }, [elapsedTime, isRunning, isDone, station])

  const handleStart = () => {
    if (!isRunning && !showNameInput) {
      // Capture the start time
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
      
      // If customer name already exists, start directly
      if (station.customerName && station.customerName.trim() !== '') {
        setIsRunning(true)
        onUpdate({
          ...station,
          isRunning: true,
          startTime: timeString,
        })
      } else {
        // Show name input field if no name exists
        // Store start time temporarily until name is saved
        setStartTime(timeString)
        setShowNameInput(true)
        setCustomerNameInput('')
        // Focus the input after a brief delay to allow animation
        setTimeout(() => {
          if (nameInputRef.current) {
            nameInputRef.current.focus()
          }
        }, 100)
      }
    }
  }

  const handleNameSave = (e) => {
    e.preventDefault()
    const trimmedName = customerNameInput.trim()
    if (trimmedName === '') {
      // Empty name, show error and keep input open
      nameInputRef.current?.focus()
      return
    }
    // Update station with customer name, start time, and start timer
    onUpdate({
      ...station,
      customerName: trimmedName,
      startTime: startTime, // Save the start time to station
      isRunning: true,
    })
    setIsRunning(true)
    setShowNameInput(false)
    setCustomerNameInput('')
    setStartTime(null)
  }

  const handleNameSubmit = (e) => {
    e.preventDefault()
    const trimmedName = customerNameInput.trim()
    if (trimmedName === '') {
      // Empty name, show error and keep input open
      nameInputRef.current?.focus()
      return
    }
    // Update station with customer name, start time, and start
    onUpdate({
      ...station,
      customerName: trimmedName,
      startTime: startTime, // Save the start time to station
      isRunning: true,
    })
    setIsRunning(true)
    setShowNameInput(false)
    setCustomerNameInput('')
    setStartTime(null)
  }

  const handleNameCancel = () => {
    setShowNameInput(false)
    setCustomerNameInput('')
    setStartTime(null)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure? Do you want to reset time?')
    if (!confirmed) {
      return // User cancelled, don't reset
    }
    
    setIsRunning(false)
    setElapsedTime(0)
    setIsDone(false)
    milestone1Hour.current = false
    milestone2Hours.current = false
    milestone3Hours.current = false
    // Also reset extra controllers, snacks, customer name, start time, and end time
    onUpdate({
      ...station,
      elapsedTime: 0,
      isRunning: false,
      isDone: false,
      extraControllers: 0,
      snacks: { cokeBottle: 0, cokeCan: 0 },
      customerName: '',
      startTime: null,
      endTime: null,
    })
  }

  const handleDone = () => {
    setIsRunning(false)
    setIsDone(true)
    // Capture the end time when Done is clicked
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    onUpdate({
      ...station,
      isDone: true,
      isRunning: false,
      endTime: timeString,
    })
    // Announce completion
    const completionMessage = `${station.name} completed`
    playAlarm(completionMessage, false)
  }

  const handleExtraControllerChange = (e) => {
    const count = parseInt(e.target.value) || 0
    onUpdate({
      ...station,
      extraControllers: count
    })
  }

  const handleSnackChange = (snackType, value) => {
    const count = parseInt(value) || 0
    onUpdate({
      ...station,
      snacks: {
        ...(station.snacks || {}),
        [snackType]: count
      }
    })
  }

  const gameType = station.gameType || GAME_TYPES.PLAYSTATION
  const snacks = station.snacks || {}
  const totalCost = calculateCost(
    elapsedTime,
    gameType,
    station.extraControllers || 0,
    snacks
  )
  
  const paidHours = calculatePaidHours(elapsedTime, gameType)
  const bonusTime = getBonusTime(elapsedTime, gameType)
  const currentRate = getRate(gameType)

  const getGameTypeColor = () => {
    if (gameType === GAME_TYPES.PLAYSTATION) return 'cyan'
    if (gameType === GAME_TYPES.STEERING_WHEEL) return 'purple'
    return 'pink'
  }

  const gameColor = getGameTypeColor()
  const borderColor = isRunning ? 'green' : isDone ? 'orange' : gameColor

  return (
    <div className={`gaming-card rounded-xl p-4 relative overflow-hidden transition-all duration-300 ${
      isRunning ? 'border-green-500/50 pulse-glow' : 
      isDone ? 'border-orange-500/50' : 
      `border-${gameColor}-500/30`
    }`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${gameColor}-500/5 rounded-full blur-2xl`}></div>
      {/* Header */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isDone ? 'bg-orange-500 neon-orange' : 
              isRunning ? 'bg-green-500 neon-green animate-pulse' : 
              `bg-${gameColor}-400`
            }`}></div>
            <h3 className={`text-sm font-bold text-${gameColor}-400 truncate`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {station.name} - {currentRate}Rs/hr
            </h3>
            {isDone && (
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider border border-orange-500/30" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Done</span>
            )}
          </div>
          {station.customerName && (
            <p className="text-xs text-slate-400 mt-1 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              👤 {station.customerName}
              {station.startTime && (
                <span className={`ml-2 text-${gameColor}-300`}>
                  🕐 {station.startTime}
                </span>
              )}
              {station.endTime && (
                <span className={`ml-2 text-orange-300`}>
                  🕐 {station.endTime}
                </span>
              )}
            </p>
          )}
        </div>
        {station.id > 7 && (
          <button
            onClick={() => onDelete(station.id)}
            className="text-slate-500 hover:text-red-400 text-xl font-bold leading-none transition-all hover:scale-110"
            aria-label="Delete station"
          >
            ×
          </button>
        )}
      </div>

      {/* Customer Name Input - Animated */}
      {showNameInput && (
        <div className={`mb-3 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-${gameColor}-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 relative z-10 shadow-2xl backdrop-blur-sm`}>
          <form onSubmit={handleNameSave} className="w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${gameColor}-500/20 flex items-center justify-center`}>
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <label className={`block text-sm font-bold text-${gameColor}-400 uppercase tracking-wide`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    Customer Name
                  </label>
                  {startTime && (
                    <span className={`text-xs font-medium text-${gameColor}-300/80 mt-0.5 block`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      🕐 Started: {startTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <input
                ref={nameInputRef}
                type="text"
                value={customerNameInput}
                onChange={(e) => setCustomerNameInput(e.target.value)}
                placeholder="Enter customer name..."
                className={`w-36 px-4 py-3 text-base border border-${gameColor}-500/30 rounded-xl bg-slate-900/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-${gameColor}-500/50 focus:border-${gameColor}-500 font-medium transition-all duration-200 placeholder:text-slate-500/60 backdrop-blur-sm`}
                style={{ fontFamily: 'Rajdhani, sans-serif', height: '48px', boxSizing: 'border-box' }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleNameSave(e)
                  }
                }}
              />
              <button
                type="submit"
                disabled={!customerNameInput.trim()}
                className={`w-12 h-12 bg-gradient-to-r from-${gameColor}-500 via-${gameColor === 'cyan' ? 'blue' : gameColor === 'purple' ? 'pink' : 'rose'}-500 to-${gameColor === 'cyan' ? 'blue' : gameColor === 'purple' ? 'pink' : 'rose'}-600 hover:from-${gameColor}-400 hover:via-${gameColor === 'cyan' ? 'blue' : gameColor === 'purple' ? 'pink' : 'rose'}-400 hover:to-${gameColor === 'cyan' ? 'blue' : gameColor === 'purple' ? 'pink' : 'rose'}-500 disabled:from-slate-700 disabled:via-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center flex-shrink-0`}
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                title="Save"
              >
                <span className="text-2xl font-bold">✓</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timer */}
      <div className={`bg-slate-800/50 rounded-lg p-4 mb-3 border border-${gameColor}-500/20 relative z-10 transition-all duration-300 ${showNameInput ? 'opacity-50' : ''}`}>
        <div className="text-center">
          <div className={`text-3xl font-bold text-${gameColor}-400 tracking-tight neon-${gameColor}`} style={{ 
            fontFamily: 'Orbitron, sans-serif'
          }}>
            {formatTime(elapsedTime || 0)}
          </div>
          {isRunning && (
            <div className="text-xs text-green-400 font-semibold mt-2 neon-green" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              ● LIVE
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={`flex gap-1.5 mb-2 transition-all duration-300 ${showNameInput ? 'opacity-50 pointer-events-none' : ''}`}>
        {!isDone ? (
          <>
            <button
              onClick={handleStart}
              disabled={isRunning || showNameInput}
              className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                isRunning || showNameInput
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600' 
                  : `bg-gradient-to-r from-${gameColor}-500 to-${gameColor === 'cyan' ? 'blue' : gameColor === 'purple' ? 'pink' : 'rose'}-500 hover:from-${gameColor}-400 hover:to-${gameColor === 'cyan' ? 'blue' : gameColor === 'purple' ? 'pink' : 'rose'}-400 text-white shadow-lg`
              }`}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ▶ Start
            </button>
            <button
              onClick={handlePause}
              disabled={!isRunning}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                !isRunning 
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600' 
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-lg'
              }`}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ⏸ Pause
            </button>
            <button
              onClick={handleDone}
              disabled={elapsedTime === 0}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                elapsedTime === 0
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-lg neon-orange'
              }`}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ✓ Done
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-xs font-bold bg-slate-700/50 hover:bg-slate-600 text-slate-300 rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ↻ Reset
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Completed</span>
          </div>
        )}
        {isDone && (
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-bold bg-slate-700/50 hover:bg-slate-600 text-slate-300 rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            ↻ Reset
          </button>
        )}
      </div>

      {/* Extras & Cost */}
      <div className="space-y-2 pt-3 border-t border-slate-700/50 relative z-10">
        {gameType === GAME_TYPES.PLAYSTATION && (
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor={`extra-ctrl-${station.id}`} className={`text-slate-400 whitespace-nowrap font-semibold text-[10px]`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Extra Ctrl:
            </label>
            <select
              id={`extra-ctrl-${station.id}`}
              value={station.extraControllers || 0}
              onChange={handleExtraControllerChange}
              className={`flex-1 px-2 py-1 text-xs border border-${gameColor}-500/30 rounded-lg bg-slate-900/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-${gameColor}-500/50 focus:border-${gameColor}-500 font-semibold`}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
              disabled={isDone}
            >
              <option value="0" className="bg-slate-800">0 (+0Rs)</option>
              <option value="1" className="bg-slate-800">1 (+50Rs)</option>
              <option value="2" className="bg-slate-800">2 (+100Rs)</option>
              <option value="3" className="bg-slate-800">3 (+150Rs)</option>
            </select>
          </div>
        )}
        
        {/* Snacks Selection */}
        <div className="space-y-1.5">
          <div className={`text-${gameColor}-400 text-[10px] font-semibold mb-0.5`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>Snacks:</div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1">
              <label htmlFor={`coke-bottle-${station.id}`} className="text-slate-400 text-[10px] font-semibold whitespace-nowrap" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Bottle:
              </label>
              <select
                id={`coke-bottle-${station.id}`}
                value={snacks.cokeBottle || 0}
                onChange={(e) => handleSnackChange('cokeBottle', e.target.value)}
                className={`flex-1 px-1.5 py-1 text-[10px] border border-${gameColor}-500/30 rounded-lg bg-slate-900/50 text-slate-200 focus:outline-none focus:ring-1 focus:ring-${gameColor}-500/50 focus:border-${gameColor}-500 font-semibold`}
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                disabled={isDone}
              >
                <option value="0" className="bg-slate-800">0</option>
                <option value="1" className="bg-slate-800">1</option>
                <option value="2" className="bg-slate-800">2</option>
                <option value="3" className="bg-slate-800">3</option>
                <option value="4" className="bg-slate-800">4</option>
                <option value="5" className="bg-slate-800">5</option>
              </select>
              <span className={`text-[10px] text-${gameColor}-400 font-semibold`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>({getCokeBottleRate()}Rs)</span>
            </div>
            <div className="flex items-center gap-1">
              <label htmlFor={`coke-can-${station.id}`} className="text-slate-400 text-[10px] font-semibold whitespace-nowrap" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Can:
              </label>
              <select
                id={`coke-can-${station.id}`}
                value={snacks.cokeCan || 0}
                onChange={(e) => handleSnackChange('cokeCan', e.target.value)}
                className={`flex-1 px-1.5 py-1 text-[10px] border border-${gameColor}-500/30 rounded-lg bg-slate-900/50 text-slate-200 focus:outline-none focus:ring-1 focus:ring-${gameColor}-500/50 focus:border-${gameColor}-500 font-semibold`}
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                disabled={isDone}
              >
                <option value="0" className="bg-slate-800">0</option>
                <option value="1" className="bg-slate-800">1</option>
                <option value="2" className="bg-slate-800">2</option>
                <option value="3" className="bg-slate-800">3</option>
                <option value="4" className="bg-slate-800">4</option>
                <option value="5" className="bg-slate-800">5</option>
              </select>
              <span className={`text-[10px] text-${gameColor}-400 font-semibold`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>({getCokeCanRate()}Rs)</span>
            </div>
          </div>
        </div>
        
        {elapsedTime > 0 && (
          <div className="text-xs space-y-0.5 pt-1">
            <div className="flex justify-between text-slate-400">
              <span className="font-semibold text-[10px]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Paid:</span>
              <span className={`font-bold text-${gameColor}-400`} style={{ fontFamily: 'Orbitron, sans-serif' }}>{formatTime(paidHours * 3600)}</span>
            </div>
            {bonusTime > 0 && (
              <div className="flex justify-between text-green-400">
                <span className="font-semibold text-[10px]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Bonus:</span>
                <span className="font-bold neon-green" style={{ fontFamily: 'Orbitron, sans-serif' }}>+{formatTime(bonusTime)}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
          <span className={`text-xs text-${gameColor}-400 font-semibold`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>Cost:</span>
          <span className={`text-base font-bold text-${gameColor}-400 neon-${gameColor}`} style={{ 
            fontFamily: 'Orbitron, sans-serif'
          }}>{totalCost}Rs</span>
        </div>
      </div>
    </div>
  )
}

export default StationCard

