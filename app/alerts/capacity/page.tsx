"use client"

import { useState, useCallback } from "react"
import { QueueTable } from "@/components/queue-table"
import type { ApiResponse, TableRow, QueueData } from "@/lib/types"
import { processQueueData } from "@/lib/data-utils"

const API_ENDPOINT = "https://api-glovo-eu.deliveryherocare.com/oneview/queue-monitor/v2/queues?token=%7B%22currentPage%22%3A%22%22%2C%22nextPage%22%3A%22%22%2C%22previousPages%22%3A%5B%5D%7D&pageSize=25&filter.channel=case-inbox%2Cchat%2Cemail&filter.queue.departments=CS%2CRS%2CVS&filter.queue.countries=ES&filter.queue.expertises=tier2%2Cdisputes%2Ctier1%2Clive-order%2Cpostorder-tier1&orderBy=casesBacklog&direction=desc"

export default function CapacityPage() {
  const [data, setData] = useState<TableRow[]>([])
  const [rawData, setRawData] = useState<QueueData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get tokens from localStorage
      const authorization = localStorage.getItem("authorization") || ""
      const profileAuthorization = localStorage.getItem("profile-authorization") || ""
      
      if (!authorization || !profileAuthorization) {
        setError("Missing tokens. Please configure them in Alerts > Token.")
        setIsLoading(false)
        return
      }

      const response = await fetch(API_ENDPOINT, {
        method: "GET",
        headers: {
          "Authorization": authorization,
          "profile-authorization": profileAuthorization,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) throw new Error("Failed to fetch data")

      const json: ApiResponse = await response.json()
      setRawData(json.list)
      const processedData = processQueueData(json.list)
      setData(processedData)
    } catch (err) {
      console.error("[v0] Error fetching data:", err)
      setError("Failed to fetch data. Please check your tokens and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="relative z-10 p-8">
      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      )}
      <QueueTable 
        data={data} 
        rawData={rawData}
        isLoading={isLoading} 
        onRefresh={fetchData} 
      />
    </div>
  )
}
