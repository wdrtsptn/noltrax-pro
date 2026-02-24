import React from 'react'
import { VideoPlayer } from './components/VideoPlayer'
import { Timeline } from './components/Timeline'
import { TaggingPanel } from './components/TaggingPanel'
import { EventsList } from './components/EventsList'
import { MatchSelector } from './components/MatchSelector'
import { useStore } from './store'

function App() {
  const { sidebarOpen, setSidebarOpen } = useStore()

  return (
    <div className="h-screen flex flex-col bg-dark text-white overflow-hidden">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">Noltrax Origin</h1>
            <p className="text-xs text-gray-400">Football Video Tagging System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded transition"
            title="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Match & Tagging */}
        {sidebarOpen && (
          <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0">
            <MatchSelector />
            <div className="flex-1 overflow-hidden">
              <TaggingPanel />
            </div>
          </aside>
        )}

        {/* Center - Video Player */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <VideoPlayer />
          </div>
          <Timeline />
        </main>

        {/* Right Sidebar - Events List */}
        <aside className="w-80 bg-gray-800 border-l border-gray-700 flex-shrink-0 overflow-hidden">
          <EventsList />
        </aside>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Space</kbd> Play/Pause</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">→</kbd> Skip 5s</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">P</kbd> Pass</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">S</kbd> Shot</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">T</kbd> Tackle</span>
        </div>
      </div>
    </div>
  )
}

export default App
