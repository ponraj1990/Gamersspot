import { useState, useEffect } from 'react'
import StationCard from './components/StationCard'
import BillingPanel from './components/BillingPanel'
import InvoiceViewer from './components/InvoiceViewer'
import { loadStations, saveStations } from './utils/storage'
import { GAME_TYPES } from './utils/pricing'

function App() {
  const [stations, setStations] = useState([])
  const [invoice, setInvoice] = useState(null)

  useEffect(() => {
    const savedStations = loadStations()
    if (savedStations.length > 0) {
      setStations(savedStations)
    } else {
      const ps5Stations = Array.from({ length: 7 }, (_, i) => ({
        id: i + 1,
        name: `PS5 Station ${i + 1}`,
        gameType: GAME_TYPES.PLAYSTATION,
        elapsedTime: 0,
        isRunning: false,
        hasExtraController: false,
      }))
      
      const desktopStations = Array.from({ length: 5 }, (_, i) => ({
        id: i + 8,
        name: `Desktop ${i + 1}`,
        gameType: GAME_TYPES.SYSTEM,
        elapsedTime: 0,
        isRunning: false,
        hasSteeringWheel: false,
      }))
      
      setStations([...ps5Stations, ...desktopStations])
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
    setStations((prev) => prev.filter((s) => s.id !== stationId))
  }

  const handleAddStation = (gameType = GAME_TYPES.PLAYSTATION) => {
    const newId = Math.max(...stations.map((s) => s.id), 0) + 1
    const existingCount = stations.filter(s => s.gameType === gameType).length
    const newStation = {
      id: newId,
      name: gameType === GAME_TYPES.PLAYSTATION ? `PS5 Station ${existingCount + 1}` : `Desktop ${existingCount + 1}`,
      gameType,
      elapsedTime: 0,
      isRunning: false,
      hasExtraController: false,
      hasSteeringWheel: false,
    }
    setStations((prev) => [...prev, newStation])
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Gamers Spot</h1>
          <p className="text-gray-800 mt-1 font-semibold">Game Zone Timer & Billing System</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-gray-700">
              <span className="text-blue-600">PS5: {stations.filter(s => s.gameType === GAME_TYPES.PLAYSTATION).length}</span>
              {' | '}
              <span className="text-green-600">Desktop: {stations.filter(s => s.gameType === GAME_TYPES.SYSTEM).length}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAddStation(GAME_TYPES.PLAYSTATION)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm"
            >
              + PS5
            </button>
            <button
              onClick={() => handleAddStation(GAME_TYPES.SYSTEM)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-sm"
            >
              + Desktop
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
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 text-lg">No stations yet. Add one to get started!</p>
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
    </div>
  )
}

export default App

