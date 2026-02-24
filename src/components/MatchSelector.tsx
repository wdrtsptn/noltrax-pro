import React, { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { Match } from '@/types'
import { formatDate } from '@/utils'

export const MatchSelector: React.FC = () => {
  const { currentMatch, setCurrentMatch, setEvents } = useStore()
  const [matches, setMatches] = useState<Match[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMatch, setNewMatch] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    video_path: ''
  })

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    const matchesData = await window.electronAPI.getMatches()
    setMatches(matchesData)
  }

  const handleSelectVideo = async () => {
    const filePath = await window.electronAPI.openFileDialog()
    if (filePath) {
      setNewMatch({ ...newMatch, video_path: filePath })
    }
  }

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMatch.name || !newMatch.video_path) {
      alert('Please fill in all fields')
      return
    }

    const matchId = await window.electronAPI.createMatch(newMatch)
    const match = await window.electronAPI.getMatch(matchId)
    
    setCurrentMatch(match)
    setEvents([])
    setShowCreateModal(false)
    setNewMatch({ name: '', date: new Date().toISOString().split('T')[0], video_path: '' })
    loadMatches()
  }

  const handleLoadMatch = async (match: Match) => {
    setCurrentMatch(match)
    const events = await window.electronAPI.getEvents(match.id)
    setEvents(events)
  }

  if (showCreateModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Create New Match</h2>
          
          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Match Name
              </label>
              <input
                type="text"
                value={newMatch.name}
                onChange={(e) => setNewMatch({ ...newMatch, name: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Arsenal vs Chelsea"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Match Date
              </label>
              <input
                type="date"
                value={newMatch.date}
                onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Video File
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMatch.video_path}
                  readOnly
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
                  placeholder="No file selected"
                />
                <button
                  type="button"
                  onClick={handleSelectVideo}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                >
                  Browse
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Supported: MP4, MKV, AVI, MOV, WEBM
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-blue-600 text-white py-2 rounded transition font-medium"
              >
                Create Match
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold">Match</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition"
        >
          + New Match
        </button>
      </div>

      {currentMatch ? (
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-white font-medium">{currentMatch.name}</h3>
              <p className="text-gray-400 text-sm">{formatDate(currentMatch.date)}</p>
            </div>
            <button
              onClick={() => setCurrentMatch(null)}
              className="text-gray-400 hover:text-white transition"
              title="Close match"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {matches.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">
              No matches yet. Create one to start.
            </div>
          ) : (
            matches.map((match) => (
              <button
                key={match.id}
                onClick={() => handleLoadMatch(match)}
                className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition"
              >
                <h3 className="text-white font-medium">{match.name}</h3>
                <p className="text-gray-400 text-sm">{formatDate(match.date)}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
