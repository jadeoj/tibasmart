import { useEffect, useRef } from 'react'

interface ProductVideoPlayerProps {
  className?: string
  poster?: string
  src?: string
  autoPlay?: boolean
  caption?: string
}

export default function ProductVideoPlayer({
  className = '',
  poster = '/assets/tiba-hmis-poster.jpg',
  src = '/assets/tiba-hmis-module-ad.mp4',
  autoPlay = true,
  caption = 'Care · Diagnostics · Pharmacy · Finance & eTIMS',
}: ProductVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !autoPlay) return

    video.muted = true
    video.defaultMuted = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')

    const startPlayback = () => {
      video.play().catch(() => {
        // Muted autoplay is supported by modern browsers; if a browser delays it,
        // the video remains a silent decorative surface without exposing controls.
      })
    }

    startPlayback()
    video.addEventListener('loadeddata', startPlayback)
    video.addEventListener('canplay', startPlayback)
    return () => {
      video.removeEventListener('loadeddata', startPlayback)
      video.removeEventListener('canplay', startPlayback)
    }
  }, [autoPlay, src])

  return (
    <div
      className={`product-video-player-container is-playing ${className}`}
      role="img"
      aria-label="TibaSmart HMIS product walkthrough"
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => event.preventDefault()}
    >
      <video
        ref={videoRef}
        className="product-video-element"
        poster={poster}
        src={src}
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        controlsList="nodownload noplaybackrate nofullscreen"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        draggable={false}
        onContextMenu={(event) => event.preventDefault()}
      />
      <div className="video-caption-bar" aria-hidden="true">
        <span className="video-live-pill"><span className="video-pulse-dot" /> AUTOPLAYING</span>
        <span>{caption}</span>
      </div>
    </div>
  )
}
