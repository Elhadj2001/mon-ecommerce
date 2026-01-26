'use client'

export default function ExportButton() {
  const downloadCSV = async () => {
    // Appel à une route API spéciale qu'on va créer
    const response = await fetch('/api/admin/export-csv')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients_monsoon_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <button 
      onClick={downloadCSV}
      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
    >
      📂 Exporter Clients (CSV)
    </button>
  )
}