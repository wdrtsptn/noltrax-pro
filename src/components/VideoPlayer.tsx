import React, { useRef, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { formatTime } from '@/utils'

export const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { currentMatch, videoState, setVideoState } = useStore()
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setVideoState({ currentTime: video.currentTime })
    }

    const handleLoadedMetadata = () => {
      setVideoState({ 
        duration: video.duration,
        ready: true 
      })
    }

    const handlePlay = () => setVideoState({ playing: true })
    const handlePause = () => setVideoState({ playing: false })

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [setVideoState])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return
    
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    
    const time = parseFloat(e.target.value)
    video.currentTime = time
    setVideoState({ currentTime: time })
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (video) video.volume = vol
  }

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current
    setPlaybackRate(rate)
    if (video) video.playbackRate = rate
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration))
  }

  if (!currentMatch) {
    return (
      <div className="flex items-center justify-center h-full bg-dark text-gray-400">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">No match loaded</p>
          <p className="text-sm mt-2">Create a new match to start tagging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Video Element */}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        <video
          ref={videoRef}
          src={`file://${currentMatch.video_path}`}
          className="max-w-full max-h-full"
          onClick={togglePlayPause}
        />
        
        {/* Playback rate indicator */}
        {playbackRate !== 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded">
            {playbackRate}x
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {/* Timeline */}
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-mono min-w-[60px]">
            {formatTime(videoState.currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={videoState.duration || 0}
            value={videoState.currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            step="0.1"
          />
          <span className="text-white text-sm font-mono min-w-[60px] text-right">
            {formatTime(videoState.duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="bg-primary hover:bg-blue-600 text-white p-2 rounded transition"
              title="Play/Pause (Space)"
            >
              {videoState.playing ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Skip buttons */}
            <button
              onClick={() => skipTime(-5)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition"
              title="Back 5s (←)"
            >
              -5s
            </button>
            <button
              onClick={() => skipTime(5)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition"
              title="Forward 5s (→)"
            >
              +5s
            </button>

            {/* Playback rate */}
            <div className="flex items-center gap-1 ml-2">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`px-2 py-1 rounded text-sm transition ${
                    playbackRate === rate
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
