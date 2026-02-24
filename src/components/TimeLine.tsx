import React, { useRef } from 'react'
import { useStore } from '@/store'
import { formatTime } from '@/utils'

export const Timeline: React.FC = () => {
  const { events, videoState, setVideoState, selectedEventId, setSelectedEventId } = useStore()
  const timelineRef = useRef<HTMLDivElement>(null)

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const time = percentage * videoState.duration
    
    setVideoState({ currentTime: time })
    
    // Update video element
    const video = document.querySelector('video')
    if (video) video.currentTime = time
  }

  const handleEventClick = (eventId: number, timestamp: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEventId(selectedEventId === eventId ? null : eventId)
    setVideoState({ currentTime: timestamp })
    
    const video = document.querySelector('video')
    if (video) video.currentTime = timestamp
  }

  const getEventPosition = (timestamp: number) => {
    if (!videoState.duration) return 0
    return (timestamp / videoState.duration) * 100
  }

  const getCurrentPosition = () => {
    if (!videoState.duration) return 0
    return (videoState.currentTime / videoState.duration) * 100
  }

  return (
    <div className="bg-gray-900 border-t border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-medium">Timeline</h3>
          <span className="text-gray-400 text-sm">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Timeline bar */}
        <div
          ref={timelineRef}
          className="relative h-16 bg-gray-800 rounded-lg cursor-pointer overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Time markers */}
          <div className="absolute inset-0 flex items-end pointer-events-none">
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <div
                key={fraction}
                className="absolute bottom-0 h-full border-l border-gray-700"
                style={{ left: `${fraction * 100}%` }}
              >
                <span className="absolute top-1 left-1 text-xs text-gray-500">
                  {formatTime(videoState.duration * fraction)}
                </span>
              </div>
            ))}
          </div>

          {/* Events */}
          {events.map((event) => (
            <div
              key={event.id}
              className={`absolute top-0 h-full cursor-pointer transition-all hover:brightness-110 ${
                selectedEventId === event.id ? 'ring-2 ring-white ring-inset z-10' : ''
              }`}
              style={{
                left: `${getEventPosition(event.timestamp_start)}%`,
                width: event.timestamp_end 
                  ? `${getEventPosition(event.timestamp_end) - getEventPosition(event.timestamp_start)}%`
                  : '2px',
                backgroundColor: event.template_color,
                minWidth: '4px'
              }}
              onClick={(e) => handleEventClick(event.id, event.timestamp_start, e)}
              title={`${event.template_name} - ${formatTime(event.timestamp_start)}`}
            />
          ))}

          {/* Current time indicator */}
          <div
            className="absolute top-0 w-0.5 h-full bg-red-500 z-20 pointer-events-none"
            style={{ left: `${getCurrentPosition()}%` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500" />
            </div>
          </div>
        </div>

        {/* Legend */}
        {events.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from(new Set(events.map(e => e.template_id))).map((templateId) => {
              const event = events.find(e => e.template_id === templateId)
              if (!event) return null
              
              const count = events.filter(e => e.template_id === templateId).length
              
              return (
                <div
                  key={templateId}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: event.template_color }}
                  />
                  <span className="text-gray-300">
                    {event.template_name} ({count})
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
