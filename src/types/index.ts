// Database Models
export interface Match {
  id: number
  name: string
  date: string
  duration: number | null
  video_path: string
  created_at: string
}

export interface EventTemplate {
  id: number
  name: string
  color: string
  shortcut_key: string | null
  metadata_schema: string | null
  created_at: string
}

export interface Event {
  id: number
  match_id: number
  template_id: number
  timestamp_start: number
  timestamp_end: number | null
  player_id: number | null
  team: string | null
  notes: string | null
  metadata: string | null
  created_at: string
  // Joined fields
  template_name?: string
  template_color?: string
}

export interface Player {
  id: number
  name: string
  team: string | null
  jersey_number: number | null
  created_at: string
}

// UI State Types
export interface VideoState {
  currentTime: number
  duration: number
  playing: boolean
  ready: boolean
}

export interface CreateEventData {
  match_id: number
  template_id: number
  timestamp_start: number
  timestamp_end?: number
  player_id?: number
  team?: string
  notes?: string
  metadata?: string
}

export interface CreateMatchData {
  name: string
  date: string
  duration?: number
  video_path: string
}

export interface CreateTemplateData {
  name: string
  color: string
  shortcut_key?: string
  metadata_schema?: string
}

export interface CreatePlayerData {
  name: string
  team?: string
  jersey_number?: number
}
