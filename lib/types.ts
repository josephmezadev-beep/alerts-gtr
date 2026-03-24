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

// Extended types for detailed capacity info
export interface ChannelCapacityInfo {
  name: string
  totalAgents: number
  controlAgents: number
  liveAgents: number
  totalTickets: number
  nonLiveTickets: number
  liveTickets: number
  concurrency: number
  thtNonLive: string
  thtLive: string
  thtNonLiveSeconds: number
  thtLiveSeconds: number
  availableAgents: number
}

export interface SimpleTier1Info {
  name: string
  onlineAgents: number
  tickets: number
  concurrency: number
  tht: string
  thtSeconds: number
  availableAgents: number
}

export interface Tier2BacklogInfo {
  customer: {
    cases: number
    hoursToSLA: number
  }
  rider: {
    cases: number
    hoursToSLA: number
  }
  vendor: {
    cases: number
    hoursToSLA: number
  }
  disputes: {
    cases: number
  }
}
