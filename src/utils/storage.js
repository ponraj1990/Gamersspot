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

export const loadStations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const stations = JSON.parse(data)
      // Migrate old game type values and extra controller format
      return stations.map(station => {
        const migrated = {
          ...station,
          gameType: migrateGameType(station.gameType || GAME_TYPES.SYSTEM)
        }
        // Migrate hasExtraController (boolean) to extraControllers (number)
        if (station.hasExtraController !== undefined && station.extraControllers === undefined) {
          migrated.extraControllers = station.hasExtraController ? 1 : 0
          // Remove old field
          delete migrated.hasExtraController
        } else if (station.extraControllers === undefined) {
          migrated.extraControllers = 0
        }
        // Migrate snacks - ensure snacks object exists with default values
        if (!station.snacks || typeof station.snacks !== 'object') {
          migrated.snacks = { cokeBottle: 0, cokeCan: 0 }
        } else {
          // Ensure both snack types exist
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
      })
    }
    return []
  } catch (error) {
    console.error('Error loading stations:', error)
    return []
  }
}

export const saveStations = (stations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stations))
  } catch (error) {
    console.error('Error saving stations:', error)
  }
}

export const clearStations = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing stations:', error)
  }
}

