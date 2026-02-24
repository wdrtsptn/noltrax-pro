import { create } from 'zustand'
import { Match, Event, EventTemplate, Player, VideoState } from '@/types'

interface AppState {
  // Current match
  currentMatch: Match | null
  setCurrentMatch: (match: Match | null) => void
  
  // Events
  events: Event[]
  setEvents: (events: Event[]) => void
  addEvent: (event: Event) => void
  removeEvent: (eventId: number) => void
  updateEvent: (eventId: number, updates: Partial<Event>) => void
  
  // Templates
  templates: EventTemplate[]
  setTemplates: (templates: EventTemplate[]) => void
  
  // Players
  players: Player[]
  setPlayers: (players: Player[]) => void
  
  // Video state
  videoState: VideoState
  setVideoState: (state: Partial<VideoState>) => void
  
  // UI state
  selectedEventId: number | null
  setSelectedEventId: (id: number | null) => void
  
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Quick tagging
  activeTemplateId: number | null
  setActiveTemplateId: (id: number | null) => void
}

export const useStore = create<AppState>((set) => ({
  // Current match
  currentMatch: null,
  setCurrentMatch: (match) => set({ currentMatch: match }),
  
  // Events
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  removeEvent: (eventId) => set((state) => ({
    events: state.events.filter(e => e.id !== eventId)
  })),
  updateEvent: (eventId, updates) => set((state) => ({
    events: state.events.map(e => e.id === eventId ? { ...e, ...updates } : e)
  })),
  
  // Templates
  templates: [],
  setTemplates: (templates) => set({ templates }),
  
  // Players
  players: [],
  setPlayers: (players) => set({ players }),
  
  // Video state
  videoState: {
    currentTime: 0,
    duration: 0,
    playing: false,
    ready: false,
  },
  setVideoState: (state) => set((prev) => ({
    videoState: { ...prev.videoState, ...state }
  })),
  
  // UI state
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Quick tagging
  activeTemplateId: null,
  setActiveTemplateId: (id) => set({ activeTemplateId: id }),
}))
