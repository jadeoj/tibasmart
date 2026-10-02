import { useEffect, useRef, useState } from 'react'

interface ProductVideoPlayerProps {
  className?: string
  poster?: string
  src?: string
  autoPlay?: boolean
  caption?: string
}

interface Chapter {
  id: string
  title: string
  timestamp: number
  range: [number, number]
}

const CHAPTERS: Chapter[] = [
  { id: 'emr', title: '01 EMR & Triage', timestamp: 0, range: [0, 3] },
  { id: 'care', title: '02 Doctor Consult', timestamp: 3, range: [3, 6] },
  { id: 'pharmacy', title: '03 Smart Pharmacy', timestamp: 6, range: [6, 8] },
  { id: 'billing', title: '04 Billing & eTIMS', timestamp: 8, range: [8, 10] },
]

export default function ProductVideoPlayer({
  className = '',
  poster = '/assets/tiba-hmis-poster.jpg',
  src = '/assets/tiba-hmis-module-ad.mp4',
  autoPlay = true,
  caption = 'Care · Diagnostics · Pharmacy · Finance & eTIMS',
}: ProductVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(10)
  const [isHovered, setIsHovered] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Initialize playback and autoplay handling
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = isMuted
    video.defaultMuted = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')

    if (autoPlay) {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setPlaybackError(null)
          })
          .catch(() => {
            // Autoplay blocked by browser policy without user gesture
            setIsPlaying(false)
          })
      }
    }
  }, [autoPlay])

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    setHasInteracted(true)
    setPlaybackError(null)

    if (video.paused || video.ended) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback request was prevented:', err)
          setIsPlaying(false)
          setPlaybackError('Click to play walkthrough video')
        })
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    const nextMuted = !isMuted
    video.muted = nextMuted
    setIsMuted(nextMuted)
  }

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video || !video.duration || Number.isNaN(video.duration)) return
    setCurrentTime(video.currentTime)
    setProgress((video.currentTime / video.duration) * 100)
    setDuration(video.duration)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const video = videoRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    if (!video || !video.duration || rect.width === 0) return
    const clickX = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width))
    video.currentTime = newProgress * video.duration
    setProgress(newProgress * 100)
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const jumpToChapter = (e: React.MouseEvent, timestamp: number) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    video.currentTime = timestamp
    setHasInteracted(true)
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const formatTime = (secs: number) => {
    if (Number.isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const currentChapter = CHAPTERS.find(
    (ch) => currentTime >= ch.range[0] && currentTime < ch.range[1]
  ) || CHAPTERS[CHAPTERS.length - 1]

  const retryPlayback = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    setPlaybackError(null)
    video.load()
    video.play().then(() => setIsPlaying(true)).catch(() => {
      setPlaybackError('Video loading failed. Please refresh page.')
    })
  }

  return (
    <div
      ref={containerRef}
      className={`product-video-player-container ${className} ${isPlaying ? 'is-playing' : 'is-paused'} ${isHovered ? 'is-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={togglePlay}
      role="region"
      aria-label="TibaSmart HMIS interactive video walkthrough"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          togglePlay()
        } else if (e.key.toLowerCase() === 'm') {
          e.preventDefault()
          const video = videoRef.current
          if (video) {
            video.muted = !isMuted
            setIsMuted(!isMuted)
          }
        } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault()
          toggleFullscreen(e as unknown as React.MouseEvent)
        }
      }}
    >
      <video
        ref={videoRef}
        className="product-video-element"
        poster={poster}
        playsInline
        loop
        muted={isMuted}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration) {
            setDuration(e.currentTarget.duration)
          }
        }}
        onPlay={() => {
          setIsPlaying(true)
          setPlaybackError(null)
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setPlaybackError('Playback interrupted. Click to restart.')
          setIsPlaying(false)
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Top Header Badge Overlay with Chapter Highlights */}
      <div className="video-overlay-top" onClick={(e) => e.stopPropagation()}>
        <div className="video-live-pill">
          <span className="video-pulse-dot" />
          <span className="video-live-text">LIVE DEMO</span>
        </div>

        {/* Interactive Chapter Pills */}
        <div className="video-chapter-deck">
          {CHAPTERS.map((ch) => {
            const isActive = currentChapter.id === ch.id
            return (
              <button
                key={ch.id}
                type="button"
                className={`video-chapter-pill ${isActive ? 'is-active' : ''}`}
                onClick={(e) => jumpToChapter(e, ch.timestamp)}
                title={`Jump to ${ch.title}`}
              >
                {ch.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Playback Error Banner if any */}
      {playbackError && (
        <div className="video-error-badge" onClick={(e) => e.stopPropagation()}>
          <span>{playbackError}</span>
          <button type="button" className="video-retry-btn" onClick={retryPlayback}>
            Retry Playback
          </button>
        </div>
      )}

      {/* Center Big Play Button (shown when paused) */}
      {!isPlaying && !playbackError && (
        <button
          type="button"
          className="video-big-play-btn"
          aria-label="Play TibaSmart product tour video"
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
        >
          <div className="video-play-pulse-ring" />
          <div className="video-play-pulse-ring-outer" />
          <div className="video-play-inner-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="video-play-text-group">
            <span className="video-play-label">
              {hasInteracted ? 'Resume Walkthrough' : 'Watch Live Product Tour'}
            </span>
            <span className="video-play-subtext">Click to explore connected care (10s)</span>
          </div>
        </button>
      )}

      {/* Bottom Interactive Control Deck */}
      <div
        className={`video-control-deck ${isHovered || !isPlaying ? 'is-visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrubber with Orange Gradient Progress */}
        <div
          className="video-scrubber"
          onClick={handleSeek}
          role="slider"
          aria-label="Video scrubber"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          tabIndex={0}
        >
          <div className="video-track">
            <div className="video-progress-fill" style={{ width: `${progress}%` }} />
            <div className="video-scrubber-thumb" style={{ left: `${progress}%` }} />
          </div>
        </div>

        {/* Lower Controls Row */}
        <div className="video-controls-row">
          <div className="video-controls-left">
            <button
              type="button"
              className="video-icon-btn video-play-toggle"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <span className="video-time-stamp">
              <strong className="time-current">{formatTime(currentTime)}</strong> /{' '}
              <span className="time-total">{formatTime(duration)}</span>
            </span>

            <span className="video-caption-text" title={caption}>
              {caption}
            </span>
          </div>

          <div className="video-controls-right">
            <button
              type="button"
              className="video-icon-btn video-sound-toggle"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute video (M)' : 'Mute video (M)'}
              title={isMuted ? 'Unmute video (M)' : 'Mute video (M)'}
            >
              {isMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                  <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
                  <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="video-icon-btn video-fullscreen-toggle"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
