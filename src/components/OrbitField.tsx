import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

const clientLogos: OrbitLogo[] = [
  { name: 'Translite Pharma', src: '/assets/clients/translite-logo.jpg', tone: 'blue' },
  { name: 'Teleflex Medical Technologies', src: '/assets/clients/teleflex-logo.jpg', tone: 'mint' },
  { name: 'Al-Siddique Medical Centre', src: '/assets/clients/logo-name.png', tone: 'cyan' },
  { name: 'Silvercrest Medcare Hospital', src: '/assets/clients/silvercrest-logo.jpg', tone: 'violet' },
  { name: 'Jalad Aesthetic Clinic', src: '/assets/clients/jalad-logo.webp', tone: 'orange' },
  { name: 'Radiance Skin Center', src: '/assets/clients/radiance-logo.png', tone: 'pink' },
  { name: "St. Jude's Hospital", src: '/assets/clients/st-jude-logo.jpg', tone: 'blue' },
  { name: 'Velma Memorial Medical Centre', src: '/assets/clients/velma-logo.jpg', tone: 'mint' },
  { name: 'Uzair Pharmacy', src: '/assets/clients/uzair-logo.jpg', tone: 'cyan' },
]

export type OrbitLogo = { name: string; src: string; tone: string; uploaded?: boolean }

type OrbitFieldProps = { uploadedLogos?: OrbitLogo[]; orbitSpeed?: number }

function OrbitField({ uploadedLogos = [], orbitSpeed = 0.24 }: OrbitFieldProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const speedRef = useRef(orbitSpeed)
  speedRef.current = orbitSpeed

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0, 14)

    const webgl = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    webgl.outputColorSpace = THREE.SRGBColorSpace
    webgl.setClearColor(0x000000, 0)
    mount.appendChild(webgl.domElement)

    const labels = new CSS2DRenderer()
    labels.domElement.className = 'orbit-label-layer'
    labels.domElement.setAttribute('aria-label', 'TibaSmart client logo orbit')
    mount.appendChild(labels.domElement)

    const orbit = new THREE.Group()
    orbit.rotation.x = -0.22
    orbit.rotation.z = -0.08
    scene.add(orbit)

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x8ecbff, transparent: true, opacity: 0.38 })
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.15, 0.012, 10, 128), ringMaterial)
    orbit.add(ring)

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.008, 10, 96), new THREE.MeshBasicMaterial({ color: 0xb7f8dc, transparent: true, opacity: 0.35 }))
    innerRing.rotation.x = Math.PI / 2
    innerRing.rotation.y = 0.2
    orbit.add(innerRing)

    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(24 * 3)
    for (let i = 0; i < 24; i += 1) {
      const radius = 3.85 + Math.random() * 0.65
      const angle = (i / 24) * Math.PI * 2
      starPositions[i * 3] = Math.cos(angle) * radius
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 3.9
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.7
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    orbit.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x8ecbff, size: 0.028, transparent: true, opacity: 0.75 })))

    let paused = false
    let isDragging = false
    let previousPointer = { x: 0, y: 0 }
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onPointerDown = (event: PointerEvent) => {
      // Allow drag on background or canvas
      if ((event.target as HTMLElement).closest('.orbit-card')) return
      isDragging = true
      previousPointer = { x: event.clientX, y: event.clientY }
      mount.style.cursor = 'grabbing'
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return
      const deltaX = event.clientX - previousPointer.x
      const deltaY = event.clientY - previousPointer.y
      previousPointer = { x: event.clientX, y: event.clientY }
      orbit.rotation.y += deltaX * 0.008
      orbit.rotation.x = Math.max(-0.9, Math.min(0.9, orbit.rotation.x + deltaY * 0.006))
    }

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false
        mount.style.cursor = ''
      }
    }

    const onPointerCancel = () => {
      isDragging = false
      mount.style.cursor = ''
    }

    const blockLogoMenu = (event: Event) => {
      if ((event.target as HTMLElement).closest('.orbit-card')) event.preventDefault()
    }
    const blockLogoDrag = (event: DragEvent) => {
      if ((event.target as HTMLElement).closest('.orbit-card')) event.preventDefault()
    }

    mount.addEventListener('pointerdown', onPointerDown)
    mount.addEventListener('contextmenu', blockLogoMenu)
    mount.addEventListener('selectstart', blockLogoMenu)
    mount.addEventListener('dragstart', blockLogoDrag)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('blur', onPointerCancel)

    const orbitLogos = [...clientLogos, ...uploadedLogos]
    const cardWidth = Math.max(82, Math.min(104, 920 / orbitLogos.length))
    const cardHeight = Math.max(50, Math.min(62, cardWidth * 0.54))
    orbitLogos.forEach((client, index) => {
      const angle = (index / orbitLogos.length) * Math.PI * 2
      const node = new THREE.Group()
      const stagger = index % 2 === 0 ? 0.13 : -0.13
      node.position.set(Math.cos(angle) * 4.25, Math.sin(angle) * 2.25 + stagger, Math.sin(angle) * 1.75)
      orbit.add(node)

      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: client.tone === 'mint' ? 0xb7f8dc : 0x5fb3ff, transparent: true, opacity: 0.9 }))
      node.add(halo)

      const element = document.createElement('button')
      element.type = 'button'
      element.className = `orbit-card orbit-card-${client.tone}${client.uploaded ? ' orbit-card-uploaded' : ''}`
      element.style.width = `${cardWidth}px`
      element.style.height = `${cardHeight}px`
      element.setAttribute('aria-label', `${client.name} client logo`)
      element.title = client.name
      element.innerHTML = `<span class="orbit-logo-frame"><img src="${client.src}" alt="${client.name} logo" loading="lazy" draggable="false" /></span>`
      const label = new CSS2DObject(element)
      label.position.set(0, 0.24, 0)
      node.add(label)
    })

    const resize = () => {
      const width = Math.max(mount.clientWidth, 260)
      const height = Math.max(mount.clientHeight, 300)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      webgl.setSize(width, height, false)
      labels.setSize(width, height)
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => { reducedMotion = event.matches }
    mediaQuery.addEventListener('change', onMotionPreferenceChange)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    let frame = 0
    let lastTime = performance.now()
    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time
      if (!paused && !reducedMotion && !isDragging) {
        orbit.rotation.y += delta * speedRef.current
        orbit.rotation.x = -0.22 + Math.sin(time * 0.0006) * 0.06
        orbit.rotation.z = -0.08 + Math.cos(time * 0.0004) * 0.04
      }
      webgl.render(scene, camera)
      labels.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      mediaQuery.removeEventListener('change', onMotionPreferenceChange)
      mount.removeEventListener('pointerdown', onPointerDown)
      mount.removeEventListener('contextmenu', blockLogoMenu)
      mount.removeEventListener('selectstart', blockLogoMenu)
      mount.removeEventListener('dragstart', blockLogoDrag)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('blur', onPointerCancel)
      ring.geometry.dispose()
      ringMaterial.dispose()
      innerRing.geometry.dispose()
      ;(innerRing.material as THREE.Material).dispose()
      starGeometry.dispose()
      webgl.dispose()
      if (mount.contains(webgl.domElement)) {
        mount.removeChild(webgl.domElement)
      }
      if (mount.contains(labels.domElement)) {
        mount.removeChild(labels.domElement)
      }
    }
  }, [uploadedLogos])

  return <div className="orbit-field" ref={mountRef} />
}

export default OrbitField
