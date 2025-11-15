import { useState, useEffect, useRef } from 'react'
import TimerDisplay from './TimerDisplay'
import { formatTime } from '../utils/timer'
import { calculateCost, calculatePaidHours, getBonusTime, GAME_TYPES, getPlayStationRate, getSystemRate } from '../utils/pricing'
import { playAlarm } from '../utils/alarm'

const StationCard = ({ station, onUpdate, onDelete }) => {
  const [elapsedTime, setElapsedTime] = useState(station.elapsedTime || 0)
  const [isRunning, setIsRunning] = useState(station.isRunning || false)
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
          const hours = newTime / 3600
          
          // 1 hour milestone (3600 seconds)
          if (hours >= 1 && !milestone1Hour.current) {
            milestone1Hour.current = true
            const message = `${station.name} - 1 hour played, 15 minutes bonus time`
            playAlarm(message, false)
          }
          
          // 2 hours milestone (7200 seconds)
          if (hours >= 2 && !milestone2Hours.current) {
            milestone2Hours.current = true
            const message = `${station.name} - 2 hours played, 30 minutes bonus time`
            playAlarm(message, false)
          }
          
          // 3 hours milestone (10800 seconds)
          if (hours >= 3 && !milestone3Hours.current) {
            milestone3Hours.current = true
            const message = `${station.name} - 3 hours played, 1 hour bonus time`
            playAlarm(message, false)
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

  useEffect(() => {
    onUpdate({
      ...station,
      elapsedTime,
      isRunning,
    })
  }, [elapsedTime, isRunning])

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsedTime(0)
    milestone1Hour.current = false
    milestone2Hours.current = false
    milestone3Hours.current = false
  }

  const handleExtraControllerToggle = () => {
    onUpdate({
      ...station,
      hasExtraController: !station.hasExtraController
    })
  }

  const handleSteeringWheelToggle = () => {
    onUpdate({
      ...station,
      hasSteeringWheel: !station.hasSteeringWheel
    })
  }

  const gameType = station.gameType || GAME_TYPES.PLAYSTATION
  const totalCost = calculateCost(
    elapsedTime,
    gameType,
    station.hasExtraController || false,
    station.hasSteeringWheel || false
  )
  
  const paidHours = calculatePaidHours(elapsedTime)
  const bonusTime = getBonusTime(elapsedTime)
  const currentRate = gameType === GAME_TYPES.PLAYSTATION 
    ? getPlayStationRate() 
    : getSystemRate()

  const isPlayStation = gameType === GAME_TYPES.PLAYSTATION
  const borderColor = isRunning 
    ? 'border-green-400 shadow-green-100' 
    : isPlayStation 
      ? 'border-blue-300' 
      : 'border-green-300'
  const bgGradient = isPlayStation 
    ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
    : 'bg-gradient-to-br from-green-50 to-green-100'

  return (
    <div className={`bg-white rounded-xl shadow-lg p-3 border-2 ${borderColor} transition-all hover:shadow-xl ${isRunning ? 'ring-2 ring-green-300' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <h3 className="text-sm font-bold text-gray-800 truncate">{station.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{currentRate}Rs/hr</p>
        </div>
        <button
          onClick={() => onDelete(station.id)}
          className="text-red-400 hover:text-red-600 text-lg font-bold leading-none"
          aria-label="Delete station"
        >
          ×
        </button>
      </div>

      {/* Timer */}
      <div className={`${bgGradient} rounded-lg p-2 mb-2`}>
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-gray-800">
            {formatTime(elapsedTime || 0)}
          </div>
          {isRunning && (
            <div className="text-xs text-green-600 font-semibold mt-1">● Running</div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-1.5 mb-2">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            isRunning 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
          }`}
        >
          ▶ Start
        </button>
        <button
          onClick={handlePause}
          disabled={!isRunning}
          className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            !isRunning 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md'
          }`}
        >
          ⏸
        </button>
        <button
          onClick={handleReset}
          className="px-2 py-1.5 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all"
        >
          ↻
        </button>
      </div>

      {/* Extras & Cost */}
      <div className="space-y-1.5 pt-2 border-t border-gray-200">
        {gameType === GAME_TYPES.PLAYSTATION && (
          <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-blue-50 p-1 rounded">
            <input
              type="checkbox"
              checked={station.hasExtraController || false}
              onChange={handleExtraControllerToggle}
              className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Extra Ctrl (+50Rs)</span>
          </label>
        )}
        {gameType === GAME_TYPES.SYSTEM && (
          <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-green-50 p-1 rounded">
            <input
              type="checkbox"
              checked={station.hasSteeringWheel || false}
              onChange={handleSteeringWheelToggle}
              className="w-3 h-3 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-700">Wheel (+150Rs)</span>
          </label>
        )}
        
        {elapsedTime > 0 && (
          <div className="text-xs space-y-0.5 pt-1">
            <div className="flex justify-between text-gray-600">
              <span>Paid:</span>
              <span className="font-semibold">{formatTime(paidHours * 3600)}</span>
            </div>
            {bonusTime > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Bonus:</span>
                <span className="font-semibold">+{formatTime(bonusTime)}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
          <span className="text-xs text-gray-600">Cost:</span>
          <span className="text-sm font-bold text-gray-800">{totalCost}Rs</span>
        </div>
      </div>
    </div>
  )
}

export default StationCard

