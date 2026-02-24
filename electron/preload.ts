import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  
  // Match operations
  createMatch: (matchData: any) => ipcRenderer.invoke('db:createMatch', matchData),
  getMatches: () => ipcRenderer.invoke('db:getMatches'),
  getMatch: (id: number) => ipcRenderer.invoke('db:getMatch', id),
  
  // Template operations
  getTemplates: () => ipcRenderer.invoke('db:getTemplates'),
  createTemplate: (template: any) => ipcRenderer.invoke('db:createTemplate', template),
  
  // Event operations
  createEvent: (eventData: any) => ipcRenderer.invoke('db:createEvent', eventData),
  getEvents: (matchId: number) => ipcRenderer.invoke('db:getEvents', matchId),
  deleteEvent: (eventId: number) => ipcRenderer.invoke('db:deleteEvent', eventId),
  updateEvent: (eventId: number, updates: any) => ipcRenderer.invoke('db:updateEvent', eventId, updates),
  
  // Player operations
  getPlayers: () => ipcRenderer.invoke('db:getPlayers'),
  createPlayer: (player: any) => ipcRenderer.invoke('db:createPlayer', player),
})

// Type definitions for TypeScript
export interface ElectronAPI {
  openFileDialog: () => Promise<string | null>
  createMatch: (matchData: any) => Promise<number>
  getMatches: () => Promise<any[]>
  getMatch: (id: number) => Promise<any>
  getTemplates: () => Promise<any[]>
  createTemplate: (template: any) => Promise<number>
  createEvent: (eventData: any) => Promise<number>
  getEvents: (matchId: number) => Promise<any[]>
  deleteEvent: (eventId: number) => Promise<boolean>
  updateEvent: (eventId: number, updates: any) => Promise<boolean>
  getPlayers: () => Promise<any[]>
  createPlayer: (player: any) => Promise<number>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
