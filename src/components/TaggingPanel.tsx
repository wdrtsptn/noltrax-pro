import React, { useEffect } from 'react'
import { useStore } from '@/store'
import { formatTime, getContrastColor } from '@/utils'

export const TaggingPanel: React.FC = () => {
  const {
    currentMatch,
    templates,
    events,
    videoState,
    setEvents,
    addEvent,
    activeTemplateId,
    setActiveTemplateId
  } = useStore()

  useEffect(() => {
    if (!currentMatch) return

    // Load templates and events
    const loadData = async () => {
      const [templatesData, eventsData] = await Promise.all([
        window.electronAPI.getTemplates(),
        window.electronAPI.getEvents(currentMatch.id)
      ])
      
      useStore.setState({ templates: templatesData })
      setEvents(eventsData)
    }

    loadData()
  }, [currentMatch, setEvents])

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Find template by shortcut
      const template = templates.find(t => t.shortcut_key?.toLowerCase() === e.key.toLowerCase())
      
      if (template && currentMatch) {
        await createEvent(template.id)
      }

      // Space bar for play/pause
      if (e.code === 'Space') {
        e.preventDefault()
        const video = document.querySelector('video')
        if (video) {
          video.paused ? video.play() : video.pause()
        }
      }

      // Arrow keys for seeking
      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        const video = document.querySelector('video')
        if (video) video.currentTime = Math.max(0, video.currentTime - 5)
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault()
        const video = document.querySelector('video')
        if (video) video.currentTime = Math.min(video.duration, video.currentTime + 5)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [templates, currentMatch, videoState])

  const createEvent = async (templateId: number) => {
    if (!currentMatch) return

    const eventData = {
      match_id: currentMatch.id,
      template_id: templateId,
      timestamp_start: videoState.currentTime,
    }

    const eventId = await window.electronAPI.createEvent(eventData)
    
    const template = templates.find(t => t.id === templateId)
    const newEvent = {
      id: eventId,
      ...eventData,
      timestamp_end: null,
      player_id: null,
      team: null,
      notes: null,
      metadata: null,
      created_at: new Date().toISOString(),
      template_name: template?.name,
      template_color: template?.color,
    }

    addEvent(newEvent as any)
  }

  const handleTemplateClick = (templateId: number) => {
    setActiveTemplateId(activeTemplateId === templateId ? null : templateId)
    createEvent(templateId)
  }

  if (!currentMatch) {
    return (
      <div className="h-full bg-gray-800 p-4 flex items-center justify-center text-gray-400">
        <p>Load a match to start tagging</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold text-lg">Quick Tags</h2>
        <p className="text-gray-400 text-sm mt-1">
          Click or use keyboard shortcuts
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {templates.map((template) => {
          const count = events.filter(e => e.template_id === template.id).length
          
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className={`w-full text-left p-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                activeTemplateId === template.id ? 'ring-2 ring-white' : ''
              }`}
              style={{
                backgroundColor: template.color,
                color: getContrastColor(template.color)
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{template.name}</span>
                <div className="flex items-center gap-2">
                  {template.shortcut_key && (
                    <kbd className="px-2 py-0.5 rounded text-xs font-mono opacity-75">
                      {template.shortcut_key.toUpperCase()}
                    </kbd>
                  )}
                  <span className="text-sm opacity-75">
                    {count}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Current timestamp display */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            Current Time
          </div>
          <div className="text-white text-2xl font-mono font-bold">
            {formatTime(videoState.currentTime)}
          </div>
        </div>
      </div>
    </div>
  )
}
