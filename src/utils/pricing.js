export const GAME_TYPES = {
  PLAYSTATION: 'PS5',
  STEERING_WHEEL: 'Steering Wheel',
  SYSTEM: 'System'
}

const PRICING_STORAGE_KEY = 'gamers-spot-pricing'

// Default pricing configuration
const defaultPricing = {
  [GAME_TYPES.PLAYSTATION]: {
    weekday: 150,
    weekend: 200
  },
  [GAME_TYPES.STEERING_WHEEL]: {
    weekday: 150,
    weekend: 150
  },
  [GAME_TYPES.SYSTEM]: {
    weekday: 100,
    weekend: 100
  }
}

export const loadPricing = () => {
  try {
    const saved = localStorage.getItem(PRICING_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge with defaults to ensure all game types exist
      const merged = { ...defaultPricing }
      
      // Update with saved values, ensuring structure is correct
      Object.keys(parsed).forEach(key => {
        if (parsed[key] && typeof parsed[key] === 'object') {
          merged[key] = {
            weekday: parsed[key].weekday ?? defaultPricing[key]?.weekday ?? 100,
            weekend: parsed[key].weekend ?? defaultPricing[key]?.weekend ?? 100
          }
        }
      })
      
      return merged
    }
    return defaultPricing
  } catch (error) {
    console.error('Error loading pricing:', error)
    return defaultPricing
  }
}

export const savePricing = (pricing) => {
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricing))
  } catch (error) {
    console.error('Error saving pricing:', error)
  }
}

export const getDayType = () => {
  const day = new Date().getDay()
  // 0 = Sunday, 6 = Saturday
  return (day === 0 || day === 6) ? 'weekend' : 'weekday'
}

export const getRate = (gameType) => {
  const pricing = loadPricing()
  const dayType = getDayType()
  
  // Handle legacy game type names (all PlayStation consoles → PS5)
  let normalizedGameType = gameType
  if (gameType === 'PlayStation' || gameType === 'PS4' || gameType === 'PS5') {
    normalizedGameType = GAME_TYPES.PLAYSTATION
  } else if (gameType === 'System' || gameType === 'Desktop') {
    normalizedGameType = GAME_TYPES.SYSTEM
  }
  
  // Get pricing for the game type, fallback to default
  const gamePricing = pricing[normalizedGameType] || defaultPricing[normalizedGameType] || defaultPricing[GAME_TYPES.SYSTEM]
  
  // Ensure we have valid pricing
  if (!gamePricing || typeof gamePricing.weekday === 'undefined' || typeof gamePricing.weekend === 'undefined') {
    console.warn(`Invalid pricing for gameType: ${gameType}, using default`)
    const defaultPricingForType = defaultPricing[normalizedGameType] || defaultPricing[GAME_TYPES.SYSTEM]
    return dayType === 'weekend' ? defaultPricingForType.weekend : defaultPricingForType.weekday
  }
  
  return dayType === 'weekend' ? gamePricing.weekend : gamePricing.weekday
}

export const getPlayStationRate = () => {
  return getRate(GAME_TYPES.PLAYSTATION)
}

export const getSystemRate = () => {
  return getRate(GAME_TYPES.SYSTEM)
}

export const getSteeringWheelGameRate = () => {
  return getRate(GAME_TYPES.STEERING_WHEEL)
}

export const getExtraControllerRate = () => {
  return 50
}

export const getSnackRates = () => {
  return {
    cokeBottle: 20,
    cokeCan: 40
  }
}

export const getCokeBottleRate = () => {
  return 20
}

export const getCokeCanRate = () => {
  return 40
}

export const getSteeringWheelRate = () => {
  return 150
}

export const calculateBonusTime = (paidHours) => {
  if (paidHours >= 3) return 3600 // 1 hour free
  if (paidHours >= 2) return 1800 // 30 minutes free
  if (paidHours >= 1) return 900  // 15 minutes free
  return 0
}

export const calculatePaidHours = (totalSeconds, gameType = null) => {
  // Calculate paid hours based on total time played (excluding bonus)
  // Bonus time is given but not charged
  const totalHours = totalSeconds / 3600
  const dayType = getDayType()
  
  // For PS5 games on weekends, apply 10-minute buffer time logic
  if (gameType === GAME_TYPES.PLAYSTATION && dayType === 'weekend') {
    const BUFFER_MINUTES = 10
    const BUFFER_SECONDS = BUFFER_MINUTES * 60
    
    if (totalSeconds === 0) return 0
    
    // Calculate full hours (rounded down)
    const fullHours = Math.floor(totalHours)
    const fullHoursSeconds = fullHours * 3600
    const bufferLimit = fullHoursSeconds + BUFFER_SECONDS
    
    // If time is within buffer (full hours + 10 mins), charge only for full hours
    if (totalSeconds <= bufferLimit) {
      return fullHours > 0 ? fullHours : 1 // Minimum 1 hour
    }
    
    // If time exceeds buffer, charge for full hours + 1 extra hour
    return fullHours + 1
  }
  
  // For Steering Wheel games on weekends, no bonus time is given, so they pay for all time
  if (gameType === GAME_TYPES.STEERING_WHEEL && dayType === 'weekend') {
    // On weekends, Steering Wheel players pay for all time (no bonus)
    if (totalHours >= 1) {
      return Math.ceil(totalHours) // Round up to nearest hour
    } else if (totalHours > 0) {
      return 1 // Minimum 1 hour charge
    }
    return 0
  }
  
  // Weekday logic (with bonus time):
  // If played 3+ hours, they paid for 3 hours and got 1 hour bonus
  // If played 2-3 hours, they paid for 2 hours and got 30 min bonus
  // If played 1-2 hours, they paid for 1 hour and got 15 min bonus
  // If played less than 1 hour, they pay for 1 hour minimum
  
  if (totalHours >= 3) {
    // Played 3+ hours: paid for 3 hours, rest is bonus
    return 3
  } else if (totalHours >= 2) {
    // Played 2-3 hours: paid for 2 hours, rest is bonus
    return 2
  } else if (totalHours >= 1) {
    // Played 1-2 hours: paid for 1 hour, rest is bonus
    return 1
  } else if (totalHours > 0) {
    // Played less than 1 hour: pay for 1 hour minimum
    return 1
  }
  return 0
}

export const calculateCost = (totalSeconds, gameType, extraControllers = 0, snacks = {}) => {
  const baseRate = getRate(gameType)
  
  // Calculate paid hours (before bonus) - pass gameType for weekend logic
  const paidHours = calculatePaidHours(totalSeconds, gameType)
  
  // Base cost for paid hours
  let cost = paidHours * baseRate
  
  // Add extra controllers for PlayStation (50Rs per controller)
  if (gameType === GAME_TYPES.PLAYSTATION && extraControllers > 0) {
    cost += extraControllers * getExtraControllerRate()
  }
  
  // Add snacks cost
  const cokeBottleCount = snacks.cokeBottle || 0
  const cokeCanCount = snacks.cokeCan || 0
  cost += (cokeBottleCount * getCokeBottleRate()) + (cokeCanCount * getCokeCanRate())
  
  return cost
}

export const getBonusTime = (totalSeconds, gameType = null) => {
  const totalHours = totalSeconds / 3600
  const dayType = getDayType()
  
  // For PS5 and Steering Wheel games, bonus time is only available on weekdays (Monday-Friday)
  // No bonus time on weekends (Saturday-Sunday) for PS5 and Steering Wheel
  if ((gameType === GAME_TYPES.PLAYSTATION || gameType === GAME_TYPES.STEERING_WHEEL) && dayType === 'weekend') {
    return 0 // No bonus on weekends for PS5 and Steering Wheel
  }
  
  // Calculate bonus time based on hours played
  if (totalHours >= 3) {
    // Played 3+ hours: got 1 hour (3600s) bonus
    return 3600
  } else if (totalHours >= 2) {
    // Played 2-3 hours: got 30 min (1800s) bonus
    return 1800
  } else if (totalHours >= 1) {
    // Played 1-2 hours: got 15 min (900s) bonus
    return 900
  }
  return 0
}

export const getEffectiveTime = (paidHours) => {
  const bonusSeconds = calculateBonusTime(paidHours)
  return (paidHours * 3600) + bonusSeconds
}

// Calculate extra time played beyond buffer for weekend PS5 games
export const getExtraTimePlayed = (totalSeconds, gameType = null) => {
  const dayType = getDayType()
  
  // Only applies to PS5 games on weekends
  if (gameType !== GAME_TYPES.PLAYSTATION || dayType !== 'weekend') {
    return 0
  }
  
  const BUFFER_MINUTES = 10
  const BUFFER_SECONDS = BUFFER_MINUTES * 60
  const totalHours = totalSeconds / 3600
  
  if (totalSeconds === 0) return 0
  
  // Calculate full hours (rounded down)
  const fullHours = Math.floor(totalHours)
  const fullHoursSeconds = fullHours * 3600
  const bufferLimit = fullHoursSeconds + BUFFER_SECONDS
  
  // If time is within buffer, no extra time
  if (totalSeconds <= bufferLimit) {
    return 0
  }
  
  // Calculate extra time beyond buffer
  const extraTime = totalSeconds - bufferLimit
  return extraTime
}

