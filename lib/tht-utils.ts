import type { THTTicket, THTAlertInfo } from "./types"
import type { Worker } from "./worker-types"

// Unicode bold text converter for Signal
const boldMap: Record<string, string> = {
  'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇',
  'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏',
  'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗',
  'Y': '𝐘', 'Z': '𝐙',
  'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡',
  'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩',
  'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱',
  'y': '𝐲', 'z': '𝐳',
  '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕',
  '8': '𝟖', '9': '𝟗',
  'á': '𝐚́', 'é': '𝐞́', 'í': '𝐢́', 'ó': '𝐨́', 'ú': '𝐮́',
  'Á': '𝐀́', 'É': '𝐄́', 'Í': '𝐈́', 'Ó': '𝐎́', 'Ú': '𝐔́',
  'ñ': '𝐧̃', 'Ñ': '𝐍̃',
}

export function toBoldUnicode(text: string): string {
  return text.split('').map(char => boldMap[char] || char).join('')
}

// Format seconds to "Xm Ys" and "HH:MM:SS"
export function formatHandlingTime(seconds: number): { short: string; full: string } {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  
  return {
    short: `${seconds}s`,
    full: `${hours.toString().padStart(2, '0')}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// Find worker by last two words of agent name
export function findWorkerByAgent(agentName: string, workers: Worker[]): Worker | null {
  const nameParts = agentName.trim().split(/\s+/)
  
  if (nameParts.length < 2) return null
  
  // Get last two words (apellidos)
  const lastTwoWords = nameParts.slice(-2).join(' ').toLowerCase()
  
  // Find workers that match the last two words
  const matches = workers.filter(worker => {
    const workerNameParts = worker.name.trim().split(/\s+/)
    if (workerNameParts.length < 2) return false
    const workerLastTwo = workerNameParts.slice(-2).join(' ').toLowerCase()
    return workerLastTwo === lastTwoWords
  })
  
  // Only return if exactly one match
  if (matches.length === 1) {
    return matches[0]
  }
  
  return null
}

// Determine company based on contract type
export function getCompanyFromContractType(contractTypeName: string): string {
  const lowerName = contractTypeName.toLowerCase()
  if (lowerName.includes('ubycall')) {
    return 'Ubycall'
  }
  return 'Concentrix'
}

// Process THT ticket to create alert info
export function processTHTTicket(ticket: THTTicket, workers: Worker[]): THTAlertInfo | null {
  const worker = findWorkerByAgent(ticket.agent, workers)
  
  if (!worker) {
    return null
  }
  
  const timeFormatted = formatHandlingTime(ticket.handlingTime)
  
  return {
    ticketId: ticket.id,
    agentName: worker.name,
    teamName: worker.team.name,
    company: getCompanyFromContractType(worker.contract_type.name),
    handlingTimeSeconds: ticket.handlingTime,
    handlingTimeFormatted: `${timeFormatted.short} (${timeFormatted.full})`,
    caseLink: `https://glovo-eu.deliveryherocare.com/cases/${ticket.id}`,
    supervisor: worker.supervisor,
    workerFound: true
  }
}

// Filter tickets with handling time > threshold (default 420 seconds = 7 minutes)
export function filterHighTHTTickets(tickets: THTTicket[], threshold: number = 420): THTTicket[] {
  return tickets.filter(ticket => ticket.handlingTime > threshold)
}

// Format THT alert text for clipboard (with Unicode bold)
export function formatTHTAlertText(info: THTAlertInfo): string {
  const teamBold = toBoldUnicode(info.teamName)
  const companyBold = toBoldUnicode(info.company)
  const agentBold = toBoldUnicode(info.agentName)
  const gestionBold = toBoldUnicode('Gestión')
  const linkBold = toBoldUnicode('Link')
  const tlBold = toBoldUnicode('TL')
  const supervisorBold = info.supervisor ? toBoldUnicode(info.supervisor) : toBoldUnicode('Sin supervisor asignado')
  
  return `${teamBold} - ${companyBold}
⚠️ ${agentBold}, THT elevado en caso asignado
⏰ ${gestionBold}: ${info.handlingTimeFormatted}
🔗 ${linkBold}: ${info.caseLink}
${tlBold}: ${supervisorBold}`
}

// Group alerts by team name
export function groupAlertsByTeam(alerts: THTAlertInfo[]): Record<string, THTAlertInfo[]> {
  return alerts.reduce((acc, alert) => {
    const team = alert.teamName
    if (!acc[team]) {
      acc[team] = []
    }
    acc[team].push(alert)
    return acc
  }, {} as Record<string, THTAlertInfo[]>)
}
