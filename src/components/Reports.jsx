import { useState, useEffect } from 'react'
import { reportsAPI, invoicesAPI } from '../utils/api'
import { formatTime } from '../utils/timer'
import InvoiceViewer from './InvoiceViewer'

const Reports = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('usage') // usage, daily-revenue, monthly-revenue
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const [usageReport, setUsageReport] = useState(null)
  const [dailyRevenue, setDailyRevenue] = useState(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    loadReport()
  }, [activeTab, selectedDate, selectedMonth, selectedYear])

  const loadReport = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'usage') {
        const data = await reportsAPI.getUsageReport(selectedDate)
        setUsageReport(data)
      } else if (activeTab === 'daily-revenue') {
        const data = await reportsAPI.getDailyRevenue(selectedDate)
        setDailyRevenue(data)
      } else if (activeTab === 'monthly-revenue') {
        const data = await reportsAPI.getMonthlyRevenue(selectedMonth, selectedYear)
        setMonthlyRevenue(data)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error loading report:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2)
  }

  const formatHours = (seconds) => {
    const hours = (seconds / 3600).toFixed(2)
    return `${hours} hrs`
  }

  const handleInvoiceClick = async (invoiceNumber) => {
    try {
      const invoice = await invoicesAPI.getByNumber(invoiceNumber)
      setSelectedInvoice(invoice)
    } catch (err) {
      console.error('Error loading invoice:', err)
      setError('Failed to load invoice details')
    }
  }

  const getCustomerNames = (invoice) => {
    if (!invoice.stations || !Array.isArray(invoice.stations)) {
      return 'N/A'
    }
    const names = invoice.stations
      .map(station => station.customerName)
      .filter(name => name && name.trim() !== '')
      .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
    return names.length > 0 ? names.join(', ') : 'N/A'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 sm:p-6 border-b border-purple-500/30">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              📊 Reports & Analytics
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl sm:text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('usage')}
            className={`flex-1 min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'usage'
                ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            🎮 System Usage
          </button>
          <button
            onClick={() => setActiveTab('daily-revenue')}
            className={`flex-1 min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'daily-revenue'
                ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            💰 Daily Revenue
          </button>
          <button
            onClick={() => setActiveTab('monthly-revenue')}
            className={`flex-1 min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'monthly-revenue'
                ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            📈 Monthly Revenue
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg">Loading report...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-400">Error: {error}</p>
            </div>
          )}

          {/* System Usage Report */}
          {activeTab === 'usage' && !loading && usageReport && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Stations</div>
                  <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {usageReport.summary.totalStations}
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active Stations</div>
                  <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {usageReport.summary.activeStations}
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Time</div>
                  <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {formatHours(usageReport.summary.totalTime)}
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Date</div>
                  <div className="text-lg font-bold text-slate-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {new Date(usageReport.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {Object.keys(usageReport.summary.byGameType).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-300 mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>By Game Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(usageReport.summary.byGameType).map(([type, data]) => (
                      <div key={type} className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                        <div className="text-sm font-semibold text-slate-400 mb-2 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{type}</div>
                        <div className="text-xl font-bold text-purple-400 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          {data.count} stations
                        </div>
                        <div className="text-sm text-cyan-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {formatHours(data.totalTime)}
                        </div>
                        {data.customers && data.customers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Players:</div>
                            <div className="text-xs text-slate-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                              {data.customers.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {usageReport.stations && usageReport.stations.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-300 mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Station Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Station</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Customer</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Time</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Start</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>End</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageReport.stations.map((station) => (
                          <tr key={station.id} className="border-b border-slate-800">
                            <td className="py-3 px-4 text-slate-300">{station.name}</td>
                            <td className="py-3 px-4 text-slate-300">{station.customer_name || '-'}</td>
                            <td className="py-3 px-4 text-cyan-400">{formatTime(station.elapsed_time || 0)}</td>
                            <td className="py-3 px-4 text-slate-400">{station.start_time || '-'}</td>
                            <td className="py-3 px-4 text-slate-400">{station.end_time || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Daily Revenue Report */}
          {activeTab === 'daily-revenue' && !loading && dailyRevenue && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Revenue</div>
                  <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {formatCurrency(dailyRevenue.summary.totalRevenue)}Rs
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Subtotal</div>
                  <div className="text-xl font-bold text-purple-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {formatCurrency(dailyRevenue.summary.totalSubtotal)}Rs
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Discount</div>
                  <div className="text-xl font-bold text-orange-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {formatCurrency(dailyRevenue.summary.totalDiscount)}Rs
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Invoices</div>
                  <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {dailyRevenue.summary.invoiceCount}
                  </div>
                </div>
              </div>

              {dailyRevenue.summary.gameTypeBreakdown && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-300 mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Game Type Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(dailyRevenue.summary.gameTypeBreakdown).map(([type, data]) => (
                      data.stationCount > 0 && (
                        <div key={type} className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                          <div className="text-sm font-semibold text-slate-400 mb-2 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{type}</div>
                          <div className="text-lg font-bold text-purple-400 mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            {data.stationCount} sessions
                          </div>
                          <div className="text-sm text-cyan-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {formatHours(data.totalTime)}
                          </div>
                          <div className="text-sm text-green-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {formatCurrency(data.totalRevenue)}Rs
                          </div>
                          {data.customers && data.customers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Players:</div>
                              <div className="text-xs text-slate-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {data.customers.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {dailyRevenue.invoices && dailyRevenue.invoices.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-300 mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Invoice Details</h3>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full text-xs sm:text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Invoice #</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Customer</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Subtotal</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Discount</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyRevenue.invoices.map((invoice) => (
                          <tr key={invoice.invoice_number} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <button
                                onClick={() => handleInvoiceClick(invoice.invoice_number)}
                                className="text-cyan-400 hover:text-cyan-300 underline decoration-dotted cursor-pointer font-semibold transition-colors text-xs sm:text-sm"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                              >
                                {invoice.invoice_number}
                              </button>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-300 text-xs sm:text-sm">{invoice.customer_names || 'N/A'}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-purple-400 text-xs sm:text-sm">{formatCurrency(invoice.subtotal)}Rs</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-orange-400 text-xs sm:text-sm">{formatCurrency(invoice.discount)}Rs</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-green-400 font-bold text-xs sm:text-sm">{formatCurrency(invoice.total)}Rs</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-400 text-xs sm:text-sm">
                              {new Date(invoice.created_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No invoices found for this date
                </div>
              )}
            </div>
          )}

          {/* Monthly Revenue Report */}
          {activeTab === 'monthly-revenue' && !loading && monthlyRevenue && (
            <div>
              <div className="mb-6 flex gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    Year
                  </label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    min="2020"
                    max="2100"
                    className="px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Revenue</div>
                  <div className="text-3xl font-bold text-green-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {formatCurrency(monthlyRevenue.summary.totalRevenue)}Rs
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Subtotal</div>
                  <div className="text-xl font-bold text-purple-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {formatCurrency(monthlyRevenue.summary.totalSubtotal)}Rs
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Discount</div>
                  <div className="text-xl font-bold text-orange-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {formatCurrency(monthlyRevenue.summary.totalDiscount)}Rs
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Invoices</div>
                  <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {monthlyRevenue.summary.invoiceCount}
                  </div>
                </div>
              </div>

              {monthlyRevenue.dailyBreakdown && monthlyRevenue.dailyBreakdown.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-300 mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Daily Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                    {monthlyRevenue.dailyBreakdown.map((day) => (
                      <div key={day.day} className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/20">
                        <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Day {day.day}</div>
                        <div className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          {formatCurrency(day.revenue)}Rs
                        </div>
                        <div className="text-xs text-cyan-400 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {day.invoiceCount} invoices
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {monthlyRevenue.summary.gameTypeBreakdown && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-300 mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Game Type Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(monthlyRevenue.summary.gameTypeBreakdown).map(([type, data]) => (
                      data.stationCount > 0 && (
                        <div key={type} className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                          <div className="text-sm font-semibold text-slate-400 mb-2 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{type}</div>
                          <div className="text-lg font-bold text-purple-400 mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            {data.stationCount} sessions
                          </div>
                          <div className="text-sm text-cyan-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {formatHours(data.totalTime)}
                          </div>
                          <div className="text-sm text-green-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {formatCurrency(data.totalRevenue)}Rs
                          </div>
                          {data.customers && data.customers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Players:</div>
                              <div className="text-xs text-slate-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {data.customers.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {monthlyRevenue.invoices && monthlyRevenue.invoices.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-300 mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>All Invoices</h3>
                  <div className="overflow-x-auto -mx-4 sm:mx-0 max-h-96">
                    <table className="w-full text-xs sm:text-sm min-w-[600px]">
                      <thead className="sticky top-0 bg-slate-800">
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Invoice #</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Customer</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Subtotal</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Discount</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyRevenue.invoices.map((invoice) => (
                          <tr key={invoice.invoice_number} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <button
                                onClick={() => handleInvoiceClick(invoice.invoice_number)}
                                className="text-cyan-400 hover:text-cyan-300 underline decoration-dotted cursor-pointer font-semibold transition-colors text-xs sm:text-sm"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                              >
                                {invoice.invoice_number}
                              </button>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-300 text-xs sm:text-sm">{invoice.customer_names || 'N/A'}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-purple-400 text-xs sm:text-sm">{formatCurrency(invoice.subtotal)}Rs</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-orange-400 text-xs sm:text-sm">{formatCurrency(invoice.discount)}Rs</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-green-400 font-bold text-xs sm:text-sm">{formatCurrency(invoice.total)}Rs</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-400 text-xs sm:text-sm">
                              {new Date(invoice.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No invoices found for this month
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceViewer
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}

export default Reports

