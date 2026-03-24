"use client"

import { useRef, useCallback } from "react"
import { toPng } from "html-to-image"
import { Copy, Image, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TableRow } from "@/lib/types"
import { formatTableAsText } from "@/lib/data-utils"
import { useState } from "react"

interface QueueTableProps {
  data: TableRow[]
  isLoading: boolean
  onRefresh: () => void
}

export function QueueTable({ data, isLoading, onRefresh }: QueueTableProps) {
  const tableRef = useRef<HTMLDivElement>(null)
  const [copiedText, setCopiedText] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)

  const copyAsText = useCallback(async () => {
    const text = formatTableAsText(data)
    await navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }, [data])

  const copyAsImage = useCallback(async () => {
    if (!tableRef.current) return

    try {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#1a1a2e",
        pixelRatio: 2,
      })

      const response = await fetch(dataUrl)
      const blob = await response.blob()

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ])
      setCopiedImage(true)
      setTimeout(() => setCopiedImage(false), 2000)
    } catch (error) {
      console.error("Error copying image:", error)
    }
  }, [])

  const getTier2Class = (channel: string) => {
    if (channel.includes("TIER2")) {
      return "text-cyan-400 font-semibold"
    }
    return ""
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Queue Status Dashboard
        </h2>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-cyan-500/25 transition-all duration-300"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Loading..." : "Get Data"}
        </Button>
      </div>

      {/* Table Container */}
      <div
        ref={tableRef}
        className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl shadow-cyan-500/10"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 opacity-50 blur-sm -z-10" />

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/30">
                <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-cyan-300">
                  Channel
                </th>
                <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-cyan-300">
                  Backlog
                </th>
                <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-cyan-300">
                  Tickets
                </th>
                <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-cyan-300">
                  Head
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 text-cyan-500/50" />
                      <span>Click &quot;Get Data&quot; to load queue information</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={row.channel}
                    className={`
                      border-b border-cyan-500/10 
                      transition-all duration-300 
                      hover:bg-cyan-500/10
                      ${index % 2 === 0 ? "bg-slate-900/50" : "bg-slate-800/30"}
                    `}
                  >
                    <td className={`px-6 py-4 font-medium ${getTier2Class(row.channel)} ${!row.channel.includes("TIER2") ? "text-slate-200" : ""}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${row.channel.includes("TIER2") ? "bg-cyan-400 shadow-lg shadow-cyan-400/50" : "bg-emerald-400 shadow-lg shadow-emerald-400/50"}`} />
                        {row.channel}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-mono ${row.backlog > 0 ? "text-amber-400 font-semibold" : "text-slate-400"}`}>
                        {row.backlog.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-blue-300">
                        {row.tickets.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-emerald-400 font-semibold">
                        {row.head}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          onClick={copyAsText}
          disabled={data.length === 0}
          variant="outline"
          className="border-cyan-500/50 bg-slate-900/50 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-300 transition-all duration-300 disabled:opacity-50"
        >
          {copiedText ? (
            <Check className="w-4 h-4 mr-2 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copiedText ? "Copied!" : "Copy as Text"}
        </Button>
        <Button
          onClick={copyAsImage}
          disabled={data.length === 0}
          variant="outline"
          className="border-blue-500/50 bg-slate-900/50 hover:bg-blue-500/20 hover:border-blue-400 text-blue-300 transition-all duration-300 disabled:opacity-50"
        >
          {copiedImage ? (
            <Check className="w-4 h-4 mr-2 text-emerald-400" />
          ) : (
            <Image className="w-4 h-4 mr-2" />
          )}
          {copiedImage ? "Copied!" : "Copy as Image"}
        </Button>
      </div>
    </div>
  )
}
