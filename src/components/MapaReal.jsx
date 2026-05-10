import { useEffect, useRef, useState } from 'react'

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

// Colores por tipo de bar
function getPinColor(bar) {
  if (bar.isCrown) return '#D4873A'
  if (bar.isGhost) return '#9E9A92'
  if (bar.isHot) return '#D94F3D'
  return '#D94F3D'
}

function getPinEmoji(bar) {
  if (bar.isGhost) return '👻'
  if (bar.isCrown) return '👑'
  return '🍺'
}

// Crea el icono SVG del pin como DivIcon de Leaflet
function createPinIcon(L, bar) {
  const color = getPinColor(bar)
  const emoji = getPinEmoji(bar)
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="width:34px;height:34px;border-radius:50%;background:${color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.25);">
          ${emoji}
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${color};margin-top:-1px;"></div>
      </div>
    `,
    iconSize: [34, 45],
    iconAnchor: [17, 45],
    popupAnchor: [0, -46],
  })
}

function createNewPinIcon(L) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;animation:bounce 0.4s ease;">
        <div style="width:38px;height:38px;border-radius:50%;background:#D94F3D;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 12px rgba(217,79,61,0.5);">
          ➕
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #D94F3D;margin-top:-1px;"></div>
      </div>
    `,
    iconSize: [38, 50],
    iconAnchor: [19, 50],
    popupAnchor: [0, -52],
  })
}

export default function MapaReal({ bares, onAddBar, onCheckin, localCheckins, userId }) {
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef([])
  const newMarkerRef = useRef(null)
  const [selectedBar, setSelectedBar] = useState(null)
  const [newPinPos, setNewPinPos] = useState(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [addingMode, setAddingMode] = useState(false)

  // Load Leaflet CSS
  useEffect(() => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
  }, [])

  // Load Leaflet JS
  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return }
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.onload = () => setLeafletLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Init map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || leafletMap.current) return
    const L = window.L

    // Fix default icon path issue with bundlers
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(mapRef.current, {
      center: [40.4168, -3.7038], // Madrid centro
      zoom: 15,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    leafletMap.current = map

    // Click en el mapa para añadir bar
    map.on('click', (e) => {
      if (!addingModeRef.current) return
      const { lat, lng } = e.latlng
      setNewPinPos({ lat, lng })

      if (newMarkerRef.current) {
        newMarkerRef.current.remove()
      }
      const marker = L.marker([lat, lng], { icon: createNewPinIcon(L), draggable: true })
      marker.addTo(map)
      marker.on('dragend', (ev) => {
        const pos = ev.target.getLatLng()
        setNewPinPos({ lat: pos.lat, lng: pos.lng })
      })
      newMarkerRef.current = marker
    })

    return () => {
      map.remove()
      leafletMap.current = null
    }
  }, [leafletLoaded])

  // Ref for addingMode so the map click handler can read it
  const addingModeRef = useRef(false)
  useEffect(() => { addingModeRef.current = addingMode }, [addingMode])

  // Render bar markers
  useEffect(() => {
    if (!leafletLoaded || !leafletMap.current) return
    const L = window.L
    const map = leafletMap.current

    // Remove old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    bares.forEach(bar => {
      if (!bar.lat || !bar.lng) return

      const marker = L.marker([bar.lat, bar.lng], {
        icon: createPinIcon(L, bar)
      })

      const score = bar.avgScore ? bar.avgScore.toFixed(1) : '—'
      const visited = bar.userVisited || localCheckins?.[bar.id]

      marker.bindPopup(`
        <div style="font-family:'Syne',sans-serif;min-width:160px;">
          <div style="font-size:15px;font-weight:800;color:#1A1916;margin-bottom:4px;">
            ${bar.name} ${bar.isCrown ? '👑' : ''} ${bar.isGhost ? '👻' : ''}
          </div>
          <div style="font-size:11px;color:#9E9A92;margin-bottom:8px;">${bar.barrio || ''}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            ${bar.precio_cana ? `<span style="font-size:10px;background:#FDF0E4;color:#D4873A;padding:2px 7px;border-radius:10px;font-weight:600;">🍺 ${bar.precio_cana}</span>` : ''}
            <span style="font-size:10px;background:#F5E8E6;color:#9C3327;padding:2px 7px;border-radius:10px;font-weight:600;">★ ${score}</span>
          </div>
          ${visited
            ? `<div style="font-size:11px;color:#3A7D5B;font-weight:600;">✓ Estuviste aquí</div>`
            : `<button onclick="window.barrioCheckin('${bar.id}')" style="font-size:11px;background:#EEEAF8;color:#6B5EA8;border:none;border-radius:8px;padding:5px 10px;cursor:pointer;font-weight:600;width:100%;">Estuve aquí</button>`
          }
        </div>
      `, { maxWidth: 220 })

      marker.on('click', () => setSelectedBar(bar))
      marker.addTo(map)
      markersRef.current.push(marker)
    })

    // Global handler for checkin button inside popup
    window.barrioCheckin = (barId) => {
      onCheckin(barId)
    }

    return () => { delete window.barrioCheckin }
  }, [leafletLoaded, bares, localCheckins])

  const handleToggleAddMode = () => {
    setAddingMode(prev => {
      if (prev) {
        // Cancel: remove new pin
        if (newMarkerRef.current) { newMarkerRef.current.remove(); newMarkerRef.current = null }
        setNewPinPos(null)
      }
      return !prev
    })
  }

  const handleConfirmLocation = () => {
    if (!newPinPos) return
    onAddBar(newPinPos)
    setAddingMode(false)
    setNewPinPos(null)
    if (newMarkerRef.current) { newMarkerRef.current.remove(); newMarkerRef.current = null }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Map */}
      <div style={{ position: 'relative', flex: 1, minHeight: 320 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Adding mode overlay hint */}
        {addingMode && (
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            background: '#1A1916', color: 'white', fontSize: 12, fontWeight: 600,
            padding: '7px 14px', borderRadius: 20, zIndex: 1000, whiteSpace: 'nowrap',
            fontFamily: 'var(--font-display)',
          }}>
            Toca el mapa para fijar la ubicación
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={handleToggleAddMode}
          style={{
            position: 'absolute', bottom: 16, right: 16, zIndex: 1000,
            width: 44, height: 44, borderRadius: '50%',
            background: addingMode ? '#5C5852' : '#D94F3D',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            fontSize: 22, color: 'white', transition: 'background 0.2s',
          }}
          title={addingMode ? 'Cancelar' : 'Añadir bar'}
        >
          {addingMode ? '✕' : '+'}
        </button>
      </div>

      {/* Confirm pin location panel */}
      {newPinPos && addingMode && (
        <div style={{
          background: 'var(--paper)', borderTop: '1px solid var(--border)',
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
              📍 Ubicación seleccionada
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
              {newPinPos.lat.toFixed(5)}, {newPinPos.lng.toFixed(5)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 2 }}>
              Puedes arrastrar el pin para ajustar
            </div>
          </div>
          <button
            onClick={handleConfirmLocation}
            style={{
              background: 'var(--red)', color: 'white', border: 'none',
              borderRadius: 10, padding: '9px 16px', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* Nearby list */}
      <div style={{ background: 'var(--paper)', padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
          color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8
        }}>
          {bares.filter(b => b.lat && b.lng).length} bares en el mapa
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
          {bares.map(bar => (
            <div
              key={bar.id}
              onClick={() => {
                if (bar.lat && bar.lng && leafletMap.current) {
                  leafletMap.current.setView([bar.lat, bar.lng], 17)
                }
                setSelectedBar(bar)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', background: 'var(--gray-50)',
                border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer',
                transition: 'background 0.12s',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: bar.isCrown ? 'var(--amber)' : bar.isGhost ? 'var(--gray-400)' : 'var(--red)'
              }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>
                {bar.name} {bar.isCrown ? '👑' : ''}{bar.isGhost ? '👻' : ''}
              </span>
              <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                {bar.lat && bar.lng ? `★ ${bar.avgScore ? bar.avgScore.toFixed(1) : '—'}` : 'sin ubicación'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
