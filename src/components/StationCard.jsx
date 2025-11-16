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
  const [isEditingCustomerName, setIsEditingCustomerName] = useState(false)
  const [editingCustomerName, setEditingCustomerName] = useState('')
  const nameInputRef = useRef(null)
  const editNameInputRef = useRef(null)
  const intervalRef = useRef(null)
  const timerStartTimeRef = useRef(null) // Track when timer actually started (timestamp)
  const lastUpdateTimeRef = useRef(null) // Track last update time for sync
  const milestone5MinWarning1H = useRef(false) // 5 minutes before 1 hour (55 minutes)
  const milestone1Hour = useRef(false)
  const milestone5MinWarning2H = useRef(false) // 5 minutes before 2 hours (115 minutes)
  const milestone2Hours = useRef(false)
  const milestone5MinWarning3H = useRef(false) // 5 minutes before 3 hours (175 minutes)
  const milestone3Hours = useRef(false)
  const milestone5MinWarning4H = useRef(false) // 5 minutes before 4 hours (235 minutes)
  const milestone4Hours = useRef(false)
  
  // Test mode: Use seconds instead of minutes for quick testing
  // Enable by running in browser console: localStorage.setItem('testMode', 'true')
  // Disable: localStorage.removeItem('testMode')
  // Or use: window.testStationTime(stationId, seconds) to manually set elapsed time
  const isTestMode = typeof window !== 'undefined' && localStorage.getItem('testMode') === 'true'
  const TIME_MULTIPLIER = isTestMode ? 1 : 60 // In test mode: 1 second = 1 minute, otherwise normal
  
  // Expose test function to window for manual testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Store test function per station
      const testKey = `testStationTime_${station.id}`
      window[testKey] = (testSeconds) => {
        console.log(`[TEST] Setting ${station.name} elapsed time to ${testSeconds} seconds`)
        const currentTestMode = localStorage.getItem('testMode') === 'true'
        const warning1H = currentTestMode ? 55 : 3300
        const hour1 = currentTestMode ? 60 : 3600
        const warning2H = currentTestMode ? 115 : 6900
        const hour2 = currentTestMode ? 120 : 7200
        const warning3H = currentTestMode ? 175 : 10500
        const hour3 = currentTestMode ? 180 : 10800
        const warning4H = currentTestMode ? 235 : 14100
        const hour4 = currentTestMode ? 240 : 14400
        
        // Reset all milestone flags to allow re-testing
        milestone5MinWarning1H.current = false
        milestone1Hour.current = false
        milestone5MinWarning2H.current = false
        milestone2Hours.current = false
        milestone5MinWarning3H.current = false
        milestone3Hours.current = false
        milestone5MinWarning4H.current = false
        milestone4Hours.current = false
        
        // Set elapsed time
        setElapsedTime(testSeconds)
        
        // Force milestone check after a brief delay to ensure state is updated
        setTimeout(() => {
          if (testSeconds >= hour4 && !milestone4Hours.current) {
            milestone4Hours.current = true
            const message = `${station.name} - you have completed 4 hours`
            playAlarm(message, false)
          } else if (testSeconds >= warning4H && !milestone5MinWarning4H.current && testSeconds < hour4) {
            milestone5MinWarning4H.current = true
            const message = `${station.name} - you have 5 minutes left for 4 hours`
            playAlarm(message, false)
          } else if (testSeconds >= hour3 && !milestone3Hours.current) {
            milestone3Hours.current = true
            const message = `${station.name} - you have completed 3 hours`
            playAlarm(message, false)
          } else if (testSeconds >= warning3H && !milestone5MinWarning3H.current && testSeconds < hour3) {
            milestone5MinWarning3H.current = true
            const message = `${station.name} - you have 5 minutes left for 3 hours`
            playAlarm(message, false)
          } else if (testSeconds >= hour2 && !milestone2Hours.current) {
            milestone2Hours.current = true
            const message = `${station.name} - you have completed 2 hours`
            playAlarm(message, false)
          } else if (testSeconds >= warning2H && !milestone5MinWarning2H.current && testSeconds < hour2) {
            milestone5MinWarning2H.current = true
            const message = `${station.name} - you have 5 minutes left for 2 hours`
            playAlarm(message, false)
          } else if (testSeconds >= hour1 && !milestone1Hour.current) {
            milestone1Hour.current = true
            const message = `${station.name} - you have completed 1 hour`
            playAlarm(message, false)
          } else if (testSeconds >= warning1H && !milestone5MinWarning1H.current && testSeconds < hour1) {
            milestone5MinWarning1H.current = true
            const message = `${station.name} - you have 5 minutes left for 1 hour`
            playAlarm(message, false)
          }
        }, 100)
      }
      
      // Also create a global helper function
      if (!window.testAllStations) {
        window.testAllStations = (testSeconds) => {
          console.log(`[TEST] Testing all stations with ${testSeconds} seconds`)
          // Find all station test functions and call them
          for (let i = 1; i <= 10; i++) {
            const testKey = `testStationTime_${i}`
            if (window[testKey]) {
              window[testKey](testSeconds)
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const isSyncingFromParent = useRef(false)
  const prevStationRef = useRef({ 
    elapsedTime: station.elapsedTime, 
    isRunning: station.isRunning, 
    isDone: station.isDone,
    customerName: station.customerName || '',
    startTime: station.startTime || null,
    endTime: station.endTime || null
  })

  // Calculate elapsed time based on actual timestamps (works even when tab is inactive)
  const calculateElapsedTime = () => {
    if (!isRunning || !timerStartTimeRef.current) {
      return elapsedTime
    }
    const now = Date.now()
    const elapsedSeconds = Math.floor((now - timerStartTimeRef.current) / 1000)
    return elapsedTime + elapsedSeconds
  }

  // Update timer using timestamps (works even when tab is inactive)
  useEffect(() => {
    if (isRunning) {
      // Initialize timer start time if not set
      if (!timerStartTimeRef.current) {
        timerStartTimeRef.current = Date.now()
        lastUpdateTimeRef.current = Date.now()
        
        // Check milestones immediately if station already has elapsed time
        // This handles cases where the app was refreshed or station was already running
        const currentElapsedTime = elapsedTime || station.elapsedTime || 0
        if (currentElapsedTime > 0) {
          const hours = currentElapsedTime / 3600
          const minutes = currentElapsedTime / 60
          const gameType = station.gameType || GAME_TYPES.PLAYSTATION
          const dayType = getDayType()
          const isWeekendNoBonus = (gameType === GAME_TYPES.PLAYSTATION || gameType === GAME_TYPES.STEERING_WHEEL) && dayType === 'weekend'
          
          // Define thresholds (in test mode: seconds = minutes, otherwise normal)
          const warning1H = isTestMode ? 55 : 3300  // 55 minutes
          const hour1 = isTestMode ? 60 : 3600      // 1 hour
          const warning2H = isTestMode ? 115 : 6900  // 115 minutes (5 min before 2h)
          const hour2 = isTestMode ? 120 : 7200      // 2 hours
          const warning3H = isTestMode ? 175 : 10500 // 175 minutes (5 min before 3h)
          const hour3 = isTestMode ? 180 : 10800     // 3 hours
          const warning4H = isTestMode ? 235 : 14100 // 235 minutes (5 min before 4h)
          const hour4 = isTestMode ? 240 : 14400     // 4 hours
          
          // Check milestones in reverse order (highest first)
          if (currentElapsedTime >= hour4 && !milestone4Hours.current) {
            milestone4Hours.current = true
            const message = `${station.name} - you have completed 4 hours`
            playAlarm(message, false)
          } else if (currentElapsedTime >= warning4H && !milestone5MinWarning4H.current && currentElapsedTime < hour4) {
            milestone5MinWarning4H.current = true
            const message = `${station.name} - you have 5 minutes left for 4 hours`
            playAlarm(message, false)
          } else if (currentElapsedTime >= hour3 && !milestone3Hours.current) {
            milestone3Hours.current = true
            const message = `${station.name} - you have completed 3 hours`
            playAlarm(message, false)
          } else if (currentElapsedTime >= warning3H && !milestone5MinWarning3H.current && currentElapsedTime < hour3) {
            milestone5MinWarning3H.current = true
            const message = `${station.name} - you have 5 minutes left for 3 hours`
            playAlarm(message, false)
          } else if (currentElapsedTime >= hour2 && !milestone2Hours.current) {
            milestone2Hours.current = true
            const message = `${station.name} - you have completed 2 hours`
            playAlarm(message, false)
          } else if (currentElapsedTime >= warning2H && !milestone5MinWarning2H.current && currentElapsedTime < hour2) {
            milestone5MinWarning2H.current = true
            const message = `${station.name} - you have 5 minutes left for 2 hours`
            playAlarm(message, false)
          } else if (currentElapsedTime >= hour1 && !milestone1Hour.current) {
            milestone1Hour.current = true
            const message = `${station.name} - you have completed 1 hour`
            playAlarm(message, false)
          } else if (currentElapsedTime >= warning1H && !milestone5MinWarning1H.current && currentElapsedTime < hour1) {
            milestone5MinWarning1H.current = true
            const message = `${station.name} - you have 5 minutes left for 1 hour`
            playAlarm(message, false)
          }
        }
      }

      // Function to update elapsed time based on actual time passed
      const updateTimer = () => {
        const now = Date.now()
        const timeSinceLastUpdate = Math.floor((now - lastUpdateTimeRef.current) / 1000)
        
        if (timeSinceLastUpdate > 0) {
          setElapsedTime((prev) => {
            const newTime = prev + timeSinceLastUpdate
            lastUpdateTimeRef.current = now
            
            // Define thresholds (in test mode: seconds = minutes, otherwise normal)
            const warning1H = isTestMode ? 55 : 3300   // 55 minutes
            const hour1 = isTestMode ? 60 : 3600       // 1 hour
            const warning2H = isTestMode ? 115 : 6900    // 115 minutes (5 min before 2h)
            const hour2 = isTestMode ? 120 : 7200       // 2 hours
            const warning3H = isTestMode ? 175 : 10500   // 175 minutes (5 min before 3h)
            const hour3 = isTestMode ? 180 : 10800      // 3 hours
            const warning4H = isTestMode ? 235 : 14100  // 235 minutes (5 min before 4h)
            const hour4 = isTestMode ? 240 : 14400      // 4 hours
            
            // Check milestones in order (lowest to highest)
            // 5 minute warning before 1 hour
            if (newTime >= warning1H && !milestone5MinWarning1H.current && newTime < hour1) {
              milestone5MinWarning1H.current = true
              const message = `${station.name} - you have 5 minutes left for 1 hour`
              playAlarm(message, false)
            }
            
            // 1 hour milestone - announce completion
            if (newTime >= hour1 && !milestone1Hour.current) {
              milestone1Hour.current = true
              const message = `${station.name} - you have completed 1 hour`
              playAlarm(message, false)
            }
            
            // 5 minute warning before 2 hours
            if (newTime >= warning2H && !milestone5MinWarning2H.current && newTime < hour2) {
              milestone5MinWarning2H.current = true
              const message = `${station.name} - you have 5 minutes left for 2 hours`
              playAlarm(message, false)
            }
            
            // 2 hours milestone - announce completion
            if (newTime >= hour2 && !milestone2Hours.current) {
              milestone2Hours.current = true
              const message = `${station.name} - you have completed 2 hours`
              playAlarm(message, false)
            }
            
            // 5 minute warning before 3 hours
            if (newTime >= warning3H && !milestone5MinWarning3H.current && newTime < hour3) {
              milestone5MinWarning3H.current = true
              const message = `${station.name} - you have 5 minutes left for 3 hours`
              playAlarm(message, false)
            }
            
            // 3 hours milestone - announce completion
            if (newTime >= hour3 && !milestone3Hours.current) {
              milestone3Hours.current = true
              const message = `${station.name} - you have completed 3 hours`
              playAlarm(message, false)
            }
            
            // 5 minute warning before 4 hours
            if (newTime >= warning4H && !milestone5MinWarning4H.current && newTime < hour4) {
              milestone5MinWarning4H.current = true
              const message = `${station.name} - you have 5 minutes left for 4 hours`
              playAlarm(message, false)
            }
            
            // 4 hours milestone - announce completion
            if (newTime >= hour4 && !milestone4Hours.current) {
              milestone4Hours.current = true
              const message = `${station.name} - you have completed 4 hours`
              playAlarm(message, false)
            }
            
            return newTime
          })
        }
      }

      // Update immediately
      updateTimer()

      // Set up interval for UI updates (but calculation is based on timestamps)
      intervalRef.current = setInterval(updateTimer, 1000)

      // Handle page visibility changes (when tab becomes active again)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isRunning) {
          // Recalculate elapsed time when tab becomes visible
          updateTimer()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    } else {
      // Timer stopped - clear start time
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      timerStartTimeRef.current = null
      lastUpdateTimeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, station.name])

  // Sync local state when station is reset from parent (including when Paid is clicked)
  useEffect(() => {
    // Check if station prop actually changed (not just a re-render)
    const stationChanged = prevStationRef.current.elapsedTime !== station.elapsedTime ||
                          prevStationRef.current.isRunning !== station.isRunning ||
                          prevStationRef.current.isDone !== station.isDone ||
                          prevStationRef.current.customerName !== (station.customerName || '') ||
                          prevStationRef.current.startTime !== (station.startTime || null) ||
                          prevStationRef.current.endTime !== (station.endTime || null)
    
    if (!stationChanged) {
      prevStationRef.current = { 
        elapsedTime: station.elapsedTime, 
        isRunning: station.isRunning, 
        isDone: station.isDone,
        customerName: station.customerName || '',
        startTime: station.startTime || null,
        endTime: station.endTime || null
      }
      return
    }
    
    // Sync isDone state from parent (only if different)
    if (station.isDone !== undefined && station.isDone !== isDone) {
      isSyncingFromParent.current = true
      setIsDone(station.isDone)
      prevStationRef.current = { 
        elapsedTime: station.elapsedTime, 
        isRunning: station.isRunning, 
        isDone: station.isDone,
        customerName: station.customerName || '',
        startTime: station.startTime || null,
        endTime: station.endTime || null
      }
      setTimeout(() => { isSyncingFromParent.current = false }, 10)
      // Don't return here, continue to check for full reset
    }
    
    // Check if parent has reset the station (after Paid button or Reset All)
    // Reset condition: elapsedTime is 0, not running, not done, no customer name, no times
    const isFullyReset = station.elapsedTime === 0 && 
                        !station.isRunning && 
                        !station.isDone &&
                        (!station.customerName || station.customerName === '') &&
                        !station.startTime &&
                        !station.endTime
    
    // Sync if parent has reset and local state doesn't match
    if (isFullyReset && (elapsedTime > 0 || isRunning || isDone || showNameInput || isEditingCustomerName)) {
      isSyncingFromParent.current = true
      setElapsedTime(0)
      setIsRunning(false)
      setIsDone(false)
      setShowNameInput(false)
      setCustomerNameInput('')
      setIsEditingCustomerName(false)
      setEditingCustomerName('')
      setStartTime(null)
      timerStartTimeRef.current = null
      lastUpdateTimeRef.current = null
      milestone5MinWarning1H.current = false
      milestone1Hour.current = false
      milestone5MinWarning2H.current = false
      milestone2Hours.current = false
      milestone5MinWarning3H.current = false
      milestone3Hours.current = false
      milestone5MinWarning4H.current = false
      milestone4Hours.current = false
      prevStationRef.current = { 
        elapsedTime: station.elapsedTime, 
        isRunning: station.isRunning, 
        isDone: station.isDone,
        customerName: station.customerName || '',
        startTime: station.startTime || null,
        endTime: station.endTime || null
      }
      setTimeout(() => { isSyncingFromParent.current = false }, 10)
    } else {
      // Update prevStationRef even if we don't sync
      prevStationRef.current = { 
        elapsedTime: station.elapsedTime, 
        isRunning: station.isRunning, 
        isDone: station.isDone,
        customerName: station.customerName || '',
        startTime: station.startTime || null,
        endTime: station.endTime || null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station.elapsedTime, station.isRunning, station.isDone, station.customerName, station.startTime, station.endTime])

  // Update parent only when local state changes, not when station prop changes
  const prevStateRef = useRef({ elapsedTime, isRunning, isDone })
  useEffect(() => {
    // Skip if we're syncing from parent to prevent loops
    if (isSyncingFromParent.current) {
      prevStateRef.current = { elapsedTime, isRunning, isDone }
      return
    }
    
    // Only update if local state actually changed (not just prop change)
    const stateChanged = prevStateRef.current.elapsedTime !== elapsedTime || 
                         prevStateRef.current.isRunning !== isRunning || 
                         prevStateRef.current.isDone !== isDone
    
    if (stateChanged) {
      // Only call onUpdate if values are different from station prop
      // This prevents updating when we just synced from parent
      // Also check if local state matches station prop (means we synced, don't update)
      const localMatchesProp = station.elapsedTime === elapsedTime && 
                               station.isRunning === isRunning && 
                               station.isDone === isDone
      
      if (!localMatchesProp) {
        onUpdate({
          ...station,
          elapsedTime,
          isRunning,
          isDone,
        })
      }
      prevStateRef.current = { elapsedTime, isRunning, isDone }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedTime, isRunning, isDone])

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
        // Announce start with station name and time
        const startMessage = `${station.name} starting time ${timeString} started`
        playAlarm(startMessage, false)
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
    // Initialize timer start timestamp if not already set
    if (!timerStartTimeRef.current) {
      timerStartTimeRef.current = Date.now()
      lastUpdateTimeRef.current = Date.now()
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
    
    // Announce start with station name and time
    if (startTime) {
      const startMessage = `${station.name} starting time ${startTime} started`
      playAlarm(startMessage, false)
    }
    
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

  const handleCustomerNameClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditingCustomerName(true)
    setEditingCustomerName(station.customerName || '')
    setTimeout(() => {
      if (editNameInputRef.current) {
        editNameInputRef.current.focus()
        editNameInputRef.current.select()
      }
    }, 100)
  }

  const handleCustomerNameSave = () => {
    const trimmedName = editingCustomerName.trim()
    onUpdate({
      ...station,
      customerName: trimmedName || station.customerName
    })
    setIsEditingCustomerName(false)
    setEditingCustomerName('')
  }

  const handleCustomerNameCancel = () => {
    setIsEditingCustomerName(false)
    setEditingCustomerName('')
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
    timerStartTimeRef.current = null
    lastUpdateTimeRef.current = null
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
          {isEditingCustomerName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                ref={editNameInputRef}
                type="text"
                value={editingCustomerName}
                onChange={(e) => setEditingCustomerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCustomerNameSave()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    handleCustomerNameCancel()
                  }
                }}
                className={`text-xs px-2 py-1 border border-${gameColor}-500/30 rounded bg-slate-900/50 text-slate-100 focus:outline-none focus:ring-1 focus:ring-${gameColor}-500/50 font-semibold`}
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                placeholder="Customer name"
              />
              <button
                onClick={handleCustomerNameSave}
                className={`text-xs px-2 py-1 bg-${gameColor}-500/20 text-${gameColor}-400 rounded hover:bg-${gameColor}-500/30 transition-colors font-semibold`}
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                title="Save"
              >
                ✓
              </button>
              <button
                onClick={handleCustomerNameCancel}
                className="text-xs px-2 py-1 bg-slate-700/50 text-slate-400 rounded hover:bg-slate-700/70 transition-colors font-semibold"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                title="Cancel"
              >
                ×
              </button>
            </div>
          ) : station.customerName ? (
            <div className="mt-1 relative z-10">
              <span 
                className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-cyan-300 transition-colors underline decoration-dotted decoration-slate-500 hover:decoration-cyan-400"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                onClick={handleCustomerNameClick}
                onDoubleClick={handleCustomerNameClick}
                title="Click or double-click to edit customer name"
              >
                👤 {station.customerName}
              </span>
              {station.startTime && (
                <span className={`ml-2 text-${gameColor}-300 text-xs`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  🕐 {station.startTime}
                </span>
              )}
              {station.endTime && (
                <span className={`ml-2 text-orange-300 text-xs`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  🕐 {station.endTime}
                </span>
              )}
            </div>
          ) : null}
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

