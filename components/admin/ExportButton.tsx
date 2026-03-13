'use client'

import { Download } from 'lucide-react'

export default function ExportButton() {
  const downloadCSV = async () => {
    const response = await fetch('/api/admin/orders/export')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commandes_maison_niang_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <button 
      onClick={downloadCSV}
      className="inline-flex items-center gap-2 bg-card border border-border text-foreground hover:bg-secondary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
    >
      <Download className="w-3.5 h-3.5" /> Export CSV
    </button>
  )
}