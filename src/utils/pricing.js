export const GAME_TYPES = {
  PLAYSTATION: 'PlayStation',
  SYSTEM: 'System'
}

export const getDayType = () => {
  const day = new Date().getDay()
  // 0 = Sunday, 6 = Saturday
  return (day === 0 || day === 6) ? 'weekend' : 'weekday'
}

export const getPlayStationRate = () => {
  return getDayType() === 'weekend' ? 200 : 150
}

export const getSystemRate = () => {
  return 100 // Same for both weekdays and weekends
}

export const getExtraControllerRate = () => {
  return 50
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

export const calculatePaidHours = (totalSeconds) => {
  // Calculate paid hours based on total time played (excluding bonus)
  // Bonus time is given but not charged
  const totalHours = totalSeconds / 3600
  
  // If played 3+ hours, they paid for 3 hours and got 1 hour bonus
  // If played 2-3 hours, they paid for 2 hours and got 30 min bonus
  // If played 1-2 hours, they paid for 1 hour and got 15 min bonus
  // If played less than 1 hour, they pay for 1 hour
  
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

export const calculateCost = (totalSeconds, gameType, hasExtraController = false, hasSteeringWheel = false) => {
  const dayType = getDayType()
  
  let baseRate
  if (gameType === GAME_TYPES.PLAYSTATION) {
    baseRate = dayType === 'weekend' ? 200 : 150
  } else {
    baseRate = 100
  }
  
  // Calculate paid hours (before bonus)
  const paidHours = calculatePaidHours(totalSeconds)
  
  // Base cost for paid hours
  let cost = paidHours * baseRate
  
  // Add extra controller for PlayStation
  if (gameType === GAME_TYPES.PLAYSTATION && hasExtraController) {
    cost += getExtraControllerRate()
  }
  
  // Add steering wheel for System games
  if (gameType === GAME_TYPES.SYSTEM && hasSteeringWheel) {
    cost += getSteeringWheelRate()
  }
  
  return cost
}

export const getBonusTime = (totalSeconds) => {
  const totalHours = totalSeconds / 3600
  
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

