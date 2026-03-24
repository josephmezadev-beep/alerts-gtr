export interface WorkerSchedule {
  start_date_pe: string | null
  end_date_pe: string | null
  start_time_pe: string | null
  end_time_pe: string | null
  break_start_date_pe: string | null
  break_end_date_pe: string | null
  break_start_time_pe: string | null
  break_end_time_pe: string | null
  start_date_es: string | null
  end_date_es: string | null
  start_time_es: string | null
  end_time_es: string | null
  break_start_date_es: string | null
  break_end_date_es: string | null
  break_start_time_es: string | null
  break_end_time_es: string | null
  is_rest_day: boolean
  obs: string | null
  attendances: unknown[]
}

export interface WorkerTeam {
  name: string
}

export interface WorkerContractType {
  name: string
}

export interface WorkerStatus {
  name: string
}

export interface WorkerRole {
  name: string
}

export interface WorkerCampaign {
  name: string
}

export interface Worker {
  document: string
  name: string
  role: WorkerRole
  status: WorkerStatus
  campaign: WorkerCampaign
  team: WorkerTeam
  contract_type: WorkerContractType
  manager: string | null
  supervisor: string | null
  coordinator: string | null
  termination_date: string | null
  requirement_id: string | null
  api_id: string | null
  api_email: string | null
  observation_1: string | null
  observation_2: string | null
  tenure: number | null
  productive: string | null
  schedules: WorkerSchedule[]
}

export interface WorkersFilters {
  team: string
  status: string
  dateRange: string
  searchText: string
  timeSlot: string | null
}

export const TEAM_OPTIONS = [
  "All Teams",
  "Customer Tier1",
  "Rider Tier1",
  "Vendor Tier1",
  "Vendor Chat",
  "Customer Tier2",
  "Rider Tier2",
  "Vendor Tier2",
] as const

export const STATUS_OPTIONS = ["All", "Activo", "Inactivo"] as const

export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const hh = hour.toString().padStart(2, "0")
      const mm = min.toString().padStart(2, "0")
      slots.push(`${hh}:${mm}`)
    }
  }
  return slots
}

export function getWeekDateRange(): { start: Date; end: Date; dates: Date[] } {
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  // Get current week's Monday
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)
  
  // Start from previous Saturday (2 days before Monday)
  const start = new Date(monday)
  start.setDate(monday.getDate() - 2)
  
  // End at current week's Sunday
  const end = new Date(monday)
  end.setDate(monday.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  // Generate all dates in range
  const dates: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return { start, end, dates }
}

export function formatDateForFilter(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function formatDateDisplay(date: Date): string {
  const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
  const day = days[date.getDay()]
  const d = date.getDate().toString().padStart(2, "0")
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  return `${day} ${d}/${m}`
}

export function isTimeInRange(
  scheduleStart: string | null,
  scheduleEnd: string | null,
  targetTime: string
): boolean {
  if (!scheduleStart || !scheduleEnd) return false
  
  // Extract time portion (HH:mm) from schedule times (format: HH:mm:ss)
  const startTime = scheduleStart.slice(0, 5)
  const endTime = scheduleEnd.slice(0, 5)
  
  const target = timeToMinutes(targetTime)
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  
  // Handle overnight schedules
  if (end < start) {
    return target >= start || target < end
  }
  
  return target >= start && target < end
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start || !end) return "-"
  // Remove seconds from time format (HH:mm:ss -> HH:mm)
  const startFormatted = start.slice(0, 5)
  const endFormatted = end.slice(0, 5)
  return `${startFormatted} - ${endFormatted}`
}
