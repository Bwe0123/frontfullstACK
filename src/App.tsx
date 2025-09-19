"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import LeadsTable from "./components/LeadsTable"
import Navigation from "./components/Navigation"
import Dashboard from "./components/Dashboard"

import Analytics, { type AnalyticsData } from "./components/Analytics"

import "./App.css"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backfullst-naol94gct-bekzats-projects-0aefee8b.vercel.app/api"
const api = axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } })

export interface Lead {
  id?: string
  client_name: string
  phone: string
  selected_car: string
  summary: string
  lead_quality: "Высокий" | "Хороший" | "Средний" | "Низкий"
  timestamp?: string | null
  source: string
}

function App() {
  const [currentView, setCurrentView] = useState<"leads" | "dashboard" | "analytics">("leads")
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  // Функция загрузки лидов
  const fetchLeads = async (params?: any): Promise<{ leads: Lead[]; total: number }> => {
    try {
      const response = await api.get("/leads", { params })
      const data = response.data

      if (Array.isArray(data)) {
        return { leads: data, total: data.length }
      }

      return {
        leads: data.leads || [],
        total: data.total || data.leads?.length || 0,
      }
    } catch (err) {
      console.error("Leads fetch error:", err)
      return { leads: [], total: 0 }
    }
  }

  // Функция подготовки аналитики
  const fetchAnalytics = async () => {
    const { leads } = await fetchLeads({ page: 1, limit: 1000 })
    if (!leads) return

    const totalLeads = leads.length
    const convertedLeads = leads.filter((l) => l.lead_quality === "Высокий").length

    // Распределение по часам
    const leadsByHour: Record<number, number> = {}
    leads.forEach((l) => {
      const hour = new Date(l.timestamp!).getHours()
      leadsByHour[hour] = (leadsByHour[hour] || 0) + 1
    })

    // Эффективность источников
    const sourcesMap: Record<string, { count: number; percentage: number }> = {}
    leads.forEach((l) => {
      const src = l.source || "Не указан"
      sourcesMap[src] = sourcesMap[src] || { count: 0, percentage: 0 }
      sourcesMap[src].count += 1
    })
    Object.keys(sourcesMap).forEach((k) => {
      sourcesMap[k].percentage = (sourcesMap[k].count / totalLeads) * 100
    })

    // Распределение по статусам
    const leadsByStatus: Record<string, number> = {}
    leads.forEach((l) => {
      leadsByStatus[l.lead_quality] = (leadsByStatus[l.lead_quality] || 0) + 1
    })

    setAnalytics({
      totalLeads,
      newLeads: leads.filter((l) => {
        const diff = (Date.now() - new Date(l.timestamp!).getTime()) / (1000 * 3600 * 24)
        return diff <= 7
      }).length,
      convertedLeads,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      revenue: 0,
      avgDealSize: 0,
      leadsToday: leads.filter((l) => new Date(l.timestamp!).toDateString() === new Date().toDateString()).length,
      leadsThisWeek: leads.filter((l) => {
        const weekAgo = new Date()
        weekAgo.setDate(new Date().getDate() - 7)
        return new Date(l.timestamp!) >= weekAgo
      }).length,
      topSources: Object.entries(sourcesMap).map(([source, val]) => ({
        source,
        count: val.count,
        percentage: val.percentage,
      })),
      leadsByStatus,
      leadsByHour,
    })
  }

  const handleExport = async (filters?: any) => {
    const result = await fetchLeads(filters)
    console.log("Экспортируем лиды:", result.leads)
  }

  useEffect(() => {
    // Подгружаем аналитику при переходе на вкладку
    if (currentView === "analytics") fetchAnalytics()
  }, [currentView])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/abstract-tech-pattern.png')] opacity-5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        onSync={fetchLeads}
        onExport={handleExport}
        lastSync={lastSync || new Date()}
        loading={false}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {currentView === "leads" && <LeadsTable onFetchLeads={fetchLeads} onExport={handleExport} />}
        {currentView === "dashboard" && <Dashboard leads={[]} onRefresh={fetchLeads} />}
        {currentView === "analytics" && <Analytics analytics={analytics} onRefresh={fetchAnalytics} />}
      </main>
    </div>
  )
}

export default App
