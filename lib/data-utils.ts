import type { QueueData, TableRow } from "./types"

export function processQueueData(data: QueueData[]): TableRow[] {
  const channelMap: Record<string, TableRow> = {}

  const getChannelName = (item: QueueData): string | null => {
    const dept = item.department
    const expertise = item.expertise
    const channel = item.channel

    // Customer mappings
    if (dept === "CS" && (expertise === "live-order" || expertise === "nonlive-order" || expertise === "tier1") && channel === "chat") {
      return "CUSTOMER TIER1"
    }
    if (dept === "CS" && expertise === "tier2" && channel === "case-inbox") {
      return "CUSTOMER TIER2"
    }

    // Rider mappings
    if (dept === "RS" && expertise === "tier1" && channel === "chat") {
      return "RIDER TIER1"
    }
    if (dept === "RS" && expertise === "tier2" && channel === "case-inbox") {
      return "RIDER TIER2"
    }

    // Vendor mappings
    if (dept === "VS" && expertise === "tier1" && channel === "chat") {
      return "VENDOR CHAT"
    }
    if (dept === "VS" && (expertise === "tier2" || expertise === "disputes") && channel === "case-inbox") {
      return "VENDOR TIER2"
    }

    return null
  }

  data.forEach((item) => {
    const channelName = getChannelName(item)
    if (!channelName) return

    if (!channelMap[channelName]) {
      channelMap[channelName] = {
        channel: channelName,
        backlog: 0,
        tickets: 0,
        head: 0,
      }
    }

    channelMap[channelName].backlog += item.casesBacklog
    channelMap[channelName].tickets += item.activeTicketsCount
    channelMap[channelName].head += item.onlineAgentCount
  })

  // Order the channels
  const order = [
    "CUSTOMER TIER1",
    "RIDER TIER1",
    "VENDOR CHAT",
    "CUSTOMER TIER2",
    "RIDER TIER2",
    "VENDOR TIER2",
  ]

  return order
    .filter((channel) => channelMap[channel])
    .map((channel) => channelMap[channel])
}

export function getRoundedTime(): string {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  const roundedMinutes = minutes < 30 ? "05" : "35"
  const formattedHours = hours.toString().padStart(2, "0")
  
  return `${formattedHours}:${roundedMinutes}`
}

export function formatTableAsText(rows: TableRow[]): string {
  const header = "CHANNEL\tBacklog\tTICKETS\tHEAD"
  const dataRows = rows.map(
    (row) => `${row.channel}\t${row.backlog}\t${row.tickets}\t${row.head}`
  )
  const time = getRoundedTime()
  const footer = `Conexión: ${time} HPE`
  
  return [header, ...dataRows, footer].join("\n")
}
