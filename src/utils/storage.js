const STORAGE_KEY = 'ps-game-timer-stations'

export const loadStations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
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

