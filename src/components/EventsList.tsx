import React, { useState } from 'react'
import { useStore } from '@/store'
import { formatTime } from '@/utils'
import { Event } from '@/types'

export const EventsList: React.FC = () => {
  const { events, removeEvent, setVideoState, selectedEventId, setSelectedEventId } = useStore()
  const [filter, setFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'time' | 'type'>('time')

  const filteredEvents = filter 
    ? events.filter(e => e.template_id === filter)
    : events

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'time') {
      return a.timestamp_start - b.timestamp_start
    } else {
      return (a.template_name || '').localeCompare(b.template_name || '')
    }
  })

  const handleEventClick = (event: Event) => {
    setSelectedEventId(selectedEventId === event.id ? null : event.id)
    setVideoState({ currentTime: event.timestamp_start })
    
    const video = document.querySelector('video')
    if (video) video.currentTime = event.timestamp_start
  }

  const handleDeleteEvent = async (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Delete this event?')) {
      await window.electronAPI.deleteEvent(eventId)
      removeEvent(eventId)
    }
  }

  const uniqueTemplates = Array.from(new Set(events.map(e => e.template_id)))
    .map(id => events.find(e => e.template_id === id)!)
    .filter(Boolean)

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold text-lg mb-3">Events</h2>
        
        {/* Filters and Sort */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`px-3 py-1 rounded text-sm transition ${
                filter === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({events.length})
            </button>
            {uniqueTemplates.map(event => {
              const count = events.filter(e => e.template_id === event.template_id).length
              return (
                <button
                  key={event.template_id}
                  onClick={() => setFilter(event.template_id)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    filter === event.template_id
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {event.template_name} ({count})
                </button>
              )
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('time')}
              className={`px-3 py-1 rounded text-sm transition ${
                sortBy === 'time'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sort by Time
            </button>
            <button
              onClick={() => setSortBy('type')}
              className={`px-3 py-1 rounded text-sm transition ${
                sortBy === 'type'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sort by Type
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sortedEvents.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No events yet</p>
            <p className="text-sm mt-1">Start tagging to see events here</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className={`bg-gray-700 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-600 ${
                selectedEventId === event.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: event.template_color }}
                    />
                    <span className="text-white font-medium">
                      {event.template_name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 font-mono">
                    {formatTime(event.timestamp_start)}
                    {event.timestamp_end && (
                      <> - {formatTime(event.timestamp_end)}</>
                    )}
                  </div>
                  {event.notes && (
                    <div className="text-sm text-gray-300 mt-1">
                      {event.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => handleDeleteEvent(event.id, e)}
                  className="text-gray-400 hover:text-red-400 transition p-1"
                  title="Delete event"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
