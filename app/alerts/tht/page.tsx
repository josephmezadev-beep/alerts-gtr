"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Timer, Download, Copy, Check, AlertTriangle, Loader2, Users } from "lucide-react"
import { useWorkersStore } from "@/lib/workers-store"
import type { THTTicket, THTTicketResponse, THTAlertInfo } from "@/lib/types"
import { 
  filterHighTHTTickets, 
  processTHTTicket, 
  formatTHTAlertText,
  groupAlertsByTeam 
} from "@/lib/tht-utils"

const THT_TIER1_URL = "https://api-glovo-eu.deliveryherocare.com/oneview/active-cases/v3/tickets?filter.chatStatus=Active&filter.queue.channel=chat&filter.queue.country=ES&filter.queue.department=CS%2CRS%2CVS&filter.queue.expertise=live-order%2Cnonlive-order%2Ctier1&orderBy=handling_time&direction=desc&cursor=%7B%22currentPage%22%3A%22%22%2C%22nextPage%22%3A%22%22%2C%22previousPages%22%3A%5B%5D%7D&pageSize=25"
const THT_TIER2_URL = "https://api-glovo-eu.deliveryherocare.com/oneview/active-cases/v3/tickets?filter.chatStatus=Active&filter.queue.channel=case-inbox&filter.queue.country=ES&filter.queue.department=CS%2CRS%2CVS&filter.queue.expertise=disputes%2Ctier2&orderBy=handling_time&direction=desc&cursor=%7B%22currentPage%22%3A%22%22%2C%22nextPage%22%3A%22%22%2C%22previousPages%22%3A%5B%5D%7D&pageSize=25"
const THT_THRESHOLD = 420 // 7 minutes in seconds

export default function THTPage() {
  const { workers, fetchWorkers } = useWorkersStore()
  const [tier1Loading, setTier1Loading] = useState(false)
  const [tier2Loading, setTier2Loading] = useState(false)
  const [tier1Alerts, setTier1Alerts] = useState<THTAlertInfo[]>([])
  const [tier2Alerts, setTier2Alerts] = useState<THTAlertInfo[]>([])
  const [tier1Error, setTier1Error] = useState<string | null>(null)
  const [tier2Error, setTier2Error] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [tokensConfigured, setTokensConfigured] = useState(false)

  useEffect(() => {
    // Fetch workers on mount
    fetchWorkers()
    
    // Check if tokens are configured
    const auth = localStorage.getItem("authorization")
    const profileAuth = localStorage.getItem("profile-authorization")
    setTokensConfigured(!!auth && !!profileAuth)
  }, [fetchWorkers])

  const fetchTHTData = async (url: string, isTier1: boolean) => {
    const setLoading = isTier1 ? setTier1Loading : setTier2Loading
    const setAlerts = isTier1 ? setTier1Alerts : setTier2Alerts
    const setError = isTier1 ? setTier1Error : setTier2Error

    setLoading(true)
    setError(null)
    setAlerts([])

    try {
      const authorization = localStorage.getItem("authorization")
      const profileAuthorization = localStorage.getItem("profile-authorization")

      if (!authorization || !profileAuthorization) {
        throw new Error("Tokens no configurados. Por favor configure los tokens en Alerts > Token")
      }

      const response = await fetch(url, {
        headers: {
          "authorization": authorization,
          "profile-authorization": profileAuthorization,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data: THTTicketResponse = await response.json()
      
      // Filter tickets with high THT
      const highTHTTickets = filterHighTHTTickets(data.tickets, THT_THRESHOLD)
      
      // Process tickets and match with workers
      const alerts: THTAlertInfo[] = []
      for (const ticket of highTHTTickets) {
        const alertInfo = processTHTTicket(ticket, workers)
        if (alertInfo) {
          alerts.push(alertInfo)
        }
      }

      setAlerts(alerts)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAlert = async (alert: THTAlertInfo) => {
    const text = formatTHTAlertText(alert)
    await navigator.clipboard.writeText(text)
    setCopiedId(alert.ticketId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const groupedTier1Alerts = groupAlertsByTeam(tier1Alerts)
  const groupedTier2Alerts = groupAlertsByTeam(tier2Alerts)

  const getTeamColor = (team: string): string => {
    if (team.toLowerCase().includes("customer")) return "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
    if (team.toLowerCase().includes("rider")) return "from-orange-500/20 to-amber-500/20 border-orange-500/30"
    if (team.toLowerCase().includes("vendor")) return "from-purple-500/20 to-pink-500/20 border-purple-500/30"
    return "from-slate-500/20 to-slate-400/20 border-slate-500/30"
  }

  const renderAlertButtons = (alerts: THTAlertInfo[], groupedAlerts: Record<string, THTAlertInfo[]>) => {
    if (alerts.length === 0) {
      return (
        <div className="flex items-center justify-center p-6 border border-dashed border-slate-700 rounded-lg">
          <p className="text-muted-foreground text-sm">
            No hay alertas con THT mayor a 7 minutos
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {Object.entries(groupedAlerts).map(([team, teamAlerts]) => (
          <div key={team} className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">{team}</span>
              <span className="text-xs text-muted-foreground">({teamAlerts.length} alertas)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {teamAlerts.map((alert) => (
                <Button
                  key={alert.ticketId}
                  variant="outline"
                  className={`h-auto py-3 px-4 justify-start text-left bg-gradient-to-br ${getTeamColor(team)} hover:opacity-90 transition-opacity`}
                  onClick={() => handleCopyAlert(alert)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {copiedId === alert.ticketId ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-foreground">
                        {alert.agentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        THT: {alert.handlingTimeFormatted}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {alert.company} - TL: {alert.supervisor || "N/A"}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative z-10 p-8 max-w-6xl mx-auto">
      <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
              <Timer className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">THT Monitoring</CardTitle>
              <CardDescription>
                Alertas de tiempo de gestion elevado (mayor a 7 minutos)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!tokensConfigured && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-200">
                Tokens no configurados. Por favor configure los tokens en{" "}
                <a href="/alerts/token" className="underline hover:text-amber-100">
                  Alerts {">"} Token
                </a>
              </p>
            </div>
          )}

          {/* Fetch Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => fetchTHTData(THT_TIER1_URL, true)}
              disabled={tier1Loading || !tokensConfigured}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              {tier1Loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              THT Tier1
            </Button>
            <Button
              onClick={() => fetchTHTData(THT_TIER2_URL, false)}
              disabled={tier2Loading || !tokensConfigured}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {tier2Loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              THT Tier2
            </Button>
          </div>

          {/* Tier 1 Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              Tier 1 - Chat
            </h3>
            {tier1Error && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-200">{tier1Error}</p>
              </div>
            )}
            {tier1Loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                <span className="ml-2 text-muted-foreground">Cargando datos...</span>
              </div>
            ) : (
              renderAlertButtons(tier1Alerts, groupedTier1Alerts)
            )}
          </div>

          {/* Tier 2 Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-400" />
              Tier 2 - Case Inbox
            </h3>
            {tier2Error && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-200">{tier2Error}</p>
              </div>
            )}
            {tier2Loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                <span className="ml-2 text-muted-foreground">Cargando datos...</span>
              </div>
            ) : (
              renderAlertButtons(tier2Alerts, groupedTier2Alerts)
            )}
          </div>

          {/* Workers status */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-muted-foreground">
              Workers cargados: {workers.length} agentes
              {workers.length === 0 && (
                <span className="text-amber-400 ml-2">
                  (Cargue los workers en la seccion Workers para habilitar el match de agentes)
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
