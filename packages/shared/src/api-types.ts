// Shapes the API returns, for the web app to read. Field names match the database.
import type { AssetStatus, AssetType } from "./assets"
import type { UserRole } from "./roles"
import type { TicketCategory, TicketPriority, TicketStatus } from "./tickets"

export type Page<T> = { items: T[]; total: number; page: number; page_size: number }

export type Ticket = {
  id: string
  ref: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  reporter_id: string
  reporter_name: string
  assignee_id: string | null
  assignee_name: string | null
  asset_id: string | null
  created_at: string
  resolved_at: string | null
  closed_at: string | null
}

export type TicketComment = {
  id: string
  body: string
  is_internal: boolean
  created_at: string
  author_name: string
}

export type TicketEvent = {
  id: string
  type: "created" | "status_changed" | "assigned" | "priority_changed"
  from_value: string | null
  to_value: string | null
  created_at: string
  actor_name: string | null // null when the system did it
}

export type TicketDetail = Ticket & {
  comments: TicketComment[]
  events: TicketEvent[]
  suggestion: { summary: string; steps: string[] } | null
}

export type SuggestionResult = { id: string; can_help: boolean; summary: string; steps: string[] }

export type Asset = {
  id: string
  asset_tag: string
  type: AssetType
  brand: string | null
  model: string | null
  serial_number: string | null
  status: AssetStatus
  location: string | null
  purchase_date: string | null
  holder_id: string | null
  holder_name: string | null
}

export type AssetDetail = Asset & {
  assignments: {
    id: string
    assigned_at: string
    returned_at: string | null
    condition_note: string | null
    employee_name: string
    assigned_by_name: string
  }[]
  maintenance: {
    id: string
    action: string
    parts: string | null
    cost: string | null
    performed_at: string
    performed_by_name: string
    ticket_id: string | null
    ticket_ref: string | null
  }[]
  tickets: { id: string; ref: string; title: string; status: TicketStatus; created_at: string }[]
}

export type Dashboard = {
  tickets: {
    open: number
    unassigned: number
    in_progress: number
    waiting: number
    resolved: number
    urgent: number
  }
  assets: { total: number; under_repair: number }
  avg_fix_hours: number | null
  quick_fix: { asked: number; solved: number; ticket_filed: number }
  recent_activity: (Omit<TicketEvent, "id"> & {
    ticket_id: string
    ticket_ref: string
    title: string
  })[]
}

export type Person = {
  id: string
  full_name: string
  email: string
  department: string | null
  role: UserRole
  is_active: boolean
}
