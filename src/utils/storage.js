import { stationsAPI } from './api'

const STORAGE_KEY = 'ps-game-timer-stations'

// Import GAME_TYPES for migration
const GAME_TYPES = {
  PLAYSTATION: 'PS5',
  STEERING_WHEEL: 'Steering Wheel',
  SYSTEM: 'System'
}

const migrateGameType = (gameType) => {
  // Migrate old game type names to new ones
  if (gameType === 'PlayStation' || gameType === 'PS4' || gameType === 'PS5') {
    return GAME_TYPES.PLAYSTATION // All PlayStation consoles map to PS5
  }
  if (gameType === 'Steering Wheel' || gameType === 'Wheel') {
    return GAME_TYPES.STEERING_WHEEL
  }
  if (gameType === 'System' || gameType === 'Desktop') {
    return GAME_TYPES.SYSTEM
  }
  // If it's already a valid new type, return as is
  if (Object.values(GAME_TYPES).includes(gameType)) {
    return gameType
  }
  // Default fallback
  return GAME_TYPES.SYSTEM
}

const migrateStation = (station) => {
  const migrated = {
    ...station,
    gameType: migrateGameType(station.gameType || GAME_TYPES.SYSTEM)
  }
  // Migrate hasExtraController (boolean) to extraControllers (number)
  if (station.hasExtraController !== undefined && station.extraControllers === undefined) {
    migrated.extraControllers = station.hasExtraController ? 1 : 0
    delete migrated.hasExtraController
  } else if (station.extraControllers === undefined) {
    migrated.extraControllers = 0
  }
  // Migrate snacks - ensure snacks object exists with default values
  if (!station.snacks || typeof station.snacks !== 'object') {
    migrated.snacks = { cokeBottle: 0, cokeCan: 0 }
  } else {
    migrated.snacks = {
      cokeBottle: station.snacks.cokeBottle || 0,
      cokeCan: station.snacks.cokeCan || 0
    }
  }
  // Migrate customer name - ensure it exists
  if (station.customerName === undefined) {
    migrated.customerName = ''
  }
  return migrated
}

// Load stations from database, fallback to localStorage
export const loadStations = async () => {
  try {
    // Try to load from database first
    const stations = await stationsAPI.getAll()
    if (stations && stations.length > 0) {
      // Migrate stations from database
      return stations.map(migrateStation)
    }
    
    // Fallback to localStorage for migration
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const localStations = JSON.parse(data)
      const migrated = localStations.map(migrateStation)
      
      // Try to save migrated stations to database
      try {
        await stationsAPI.saveAll(migrated)
        // Clear localStorage after successful migration
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to migrate to database, keeping localStorage:', error)
      }
      
      return migrated
    }
    
    return []
  } catch (error) {
    console.error('Error loading stations from database, trying localStorage:', error)
    
    // Fallback to localStorage
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const stations = JSON.parse(data)
        return stations.map(migrateStation)
      }
    } catch (localError) {
      console.error('Error loading from localStorage:', localError)
    }
    
    return []
  }
}

// Save stations to database
export const saveStations = async (stations) => {
  try {
    // Save to database
    await stationsAPI.saveAll(stations)
    
    // Also save to localStorage as backup
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stations))
    } catch (localError) {
      console.warn('Failed to save to localStorage:', localError)
    }
  } catch (error) {
    console.error('Error saving stations to database:', error)
    
    // Fallback to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stations))
    } catch (localError) {
      console.error('Error saving to localStorage:', localError)
    }
  }
}

export const clearStations = async () => {
  try {
    // Clear from database
    await stationsAPI.saveAll([])
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing stations:', error)
    localStorage.removeItem(STORAGE_KEY)
  }
}

