export interface QueueData {
  activeTicketsCount: number
  avgHandlingTime: number
  avgWaitTime: number
  casesBacklog: number
  channel: string
  country: string
  department: string
  expertise: string
  id: string
  language: string
  longestWaitTime: number
  onlineAgentCount: number
  queueName: string
  totalAgentCount: number
}

export interface ApiResponse {
  cursor: {
    currentPage: string
    nextPage: string
    previousPages: string[]
  }
  list: QueueData[]
  pageSize: number
}

export interface TableRow {
  channel: string
  backlog: number
  tickets: number
  head: number
}
