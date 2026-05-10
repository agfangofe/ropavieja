import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix broken marker icons with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const CARTO = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const CARTO_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>'

function makePinIcon(color, emoji) {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:34px;height:34px;border-radius:50%;background:${color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${emoji}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ${color};margin-top:-1px;"></div>
    </div>`,
    iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -46],
  })
}

function barIcon(bar) {
  const color = bar.isCrown ? '#D4873A' : bar.isGhost ? '#9E9A92' : '#D94F3D'
  const emoji = bar.isGhost ? '👻' : bar.isCrown ? '👑' : '🍺'
  return makePinIcon(color, emoji)
}

function newPinIcon() {
  return makePinIcon('#D94F3D', '📍')
}

function useLeafletMap(containerRef, options = {}) {
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    const map = L.map(containerRef.current, {
      center: options.center || [40.4168, -3.7038],
      zoom: options.zoom || 15,
      zoomControl: options.zoomControl !== false,
    })

    L.tileLayer(CARTO, {
      attribution: CARTO_ATTR,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Must call after DOM is fully painted
    requestAnimationFrame(() => {
      setTimeout(() => {
        map.invalidateSize()
      }, 50)
    })

    mapRef.current = map
    if (options.onReady) options.onReady(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return mapRef
}

// ─── Main map for the Mapa tab ────────────────────────────────────────────────
export default function MapaReal({ bares, onAddBar, onCheckin, localCheckins }) {
  const containerRef = useRef(null)
  const layerRef = useRef(null)
  const newMarkerRef = useRef(null)
  const addingRef = useRef(false)
  const [adding, setAdding] = useState(false)
  const [pinPos, setPinPos] = useState(null)

  useEffect(() => { addingRef.current = adding }, [adding])

  const mapRef = useLeafletMap(containerRef, {
    onReady(map) {
      layerRef.current = L.layerGroup().addTo(map)

      map.on('click', (e) => {
        if (!addingRef.current) return
        const { lat, lng } = e.latlng
        if (newMarkerRef.current) newMarkerRef.current.remove()
        const m = L.marker([lat, lng], { icon: newPinIcon(), draggable: true }).addTo(map)
        m.on('dragend', ev => {
          const p = ev.target.getLatLng()
          setPinPos({ lat: p.lat, lng: p.lng })
        })
        newMarkerRef.current = m
        setPinPos({ lat, lng })
      })
    }
  })

  // Render bar markers
  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.clearLayers()

    bares.forEach(bar => {
      if (!bar.lat || !bar.lng) return
      const visited = bar.userVisited || localCheckins?.[bar.id]
      const m = L.marker([bar.lat, bar.lng], { icon: barIcon(bar) })

      m.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:160px;padding:2px;">
          <div style="font-size:14px;font-weight:700;color:#1A1916;margin-bottom:3px;">
            ${bar.name} ${bar.isCrown ? '👑' : ''} ${bar.isGhost ? '👻' : ''}
          </div>
          <div style="font-size:11px;color:#9E9A92;margin-bottom:7px;">${bar.barrio || ''}</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">
            ${bar.precio_cana ? `<span style="font-size:10px;background:#FDF0E4;color:#D4873A;padding:2px 7px;border-radius:10px;font-weight:600;">🍺 ${bar.precio_cana}</span>` : ''}
            <span style="font-size:10px;background:#F5E8E6;color:#9C3327;padding:2px 7px;border-radius:10px;font-weight:600;">
              ★ ${bar.avgScore ? bar.avgScore.toFixed(1) : '—'}
            </span>
          </div>
          ${visited
            ? `<div style="font-size:11px;color:#3A7D5B;font-weight:600;text-align:center;">✓ Estuviste aquí</div>`
            : `<button id="ci-${bar.id}" style="font-size:11px;background:#EEEAF8;color:#6B5EA8;border:none;border-radius:8px;padding:5px 10px;cursor:pointer;font-weight:600;width:100%;">📍 Estuve aquí</button>`
          }
        </div>
      `)

      m.on('popupopen', () => {
        const btn = document.getElementById(`ci-${bar.id}`)
        if (btn) btn.onclick = () => { onCheckin(bar.id); m.closePopup() }
      })

      layerRef.current.addLayer(m)
    })
  }, [bares, localCheckins])

  const toggleAdding = () => {
    if (adding) {
      if (newMarkerRef.current) { newMarkerRef.current.remove(); newMarkerRef.current = null }
      setPinPos(null)
    }
    setAdding(p => !p)
  }

  const confirm = () => {
    if (!pinPos) return
    onAddBar(pinPos)
    if (newMarkerRef.current) { newMarkerRef.current.remove(); newMarkerRef.current = null }
    setPinPos(null)
    setAdding(false)
  }

  const baresConUbicacion = bares.filter(b => b.lat && b.lng).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* MAP */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

        {adding && (
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            background: '#1A1916', color: 'white', fontSize: 12, fontWeight: 600,
            padding: '8px 16px', borderRadius: 20, zIndex: 1000, whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            👆 Toca el mapa para fijar el bar
          </div>
        )}

        <button
          onClick={toggleAdding}
          style={{
            position: 'absolute', bottom: 16, right: 16, zIndex: 1000,
            width: 46, height: 46, borderRadius: '50%',
            background: adding ? '#5C5852' : '#D94F3D',
            border: 'none', cursor: 'pointer', fontSize: 22, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(0,0,0,0.3)', transition: 'background 0.2s',
          }}
        >
          {adding ? '✕' : '+'}
        </button>
      </div>

      {/* CONFIRM BAR */}
      {pinPos && adding && (
        <div style={{ background: '#FDFCFA', borderTop: '1px solid rgba(26,25,22,0.1)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1916' }}>📍 Ubicación marcada</div>
            <div style={{ fontSize: 11, color: '#9E9A92', marginTop: 2 }}>Arrastra el pin para ajustar</div>
          </div>
          <button onClick={confirm} style={{ background: '#D94F3D', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            Continuar →
          </button>
        </div>
      )}

      {/* LIST */}
      <div style={{ background: '#FDFCFA', padding: '10px 14px', borderTop: '1px solid rgba(26,25,22,0.1)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9E9A92', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          {baresConUbicacion} de {bares.length} bares en el mapa
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 140, overflowY: 'auto' }}>
          {bares.map(bar => (
            <div
              key={bar.id}
              onClick={() => bar.lat && mapRef.current?.setView([bar.lat, bar.lng], 17)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#F7F6F4', border: '1px solid rgba(26,25,22,0.1)', borderRadius: 10, cursor: bar.lat ? 'pointer' : 'default', opacity: bar.lat ? 1 : 0.5 }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: bar.isCrown ? '#D4873A' : bar.isGhost ? '#9E9A92' : '#D94F3D' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1916', flex: 1 }}>
                {bar.name} {bar.isCrown ? '👑' : ''}{bar.isGhost ? '👻' : ''}
              </span>
              <span style={{ fontSize: 11, color: '#9E9A92' }}>
                {bar.lat ? `★ ${bar.avgScore ? bar.avgScore.toFixed(1) : '—'}` : 'sin ubicación'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mini map for AddBarModal ─────────────────────────────────────────────────
export function MiniMapa({ onLocationPick, initialCoords }) {
  const containerRef = useRef(null)
  const markerRef = useRef(null)

  useLeafletMap(containerRef, {
    center: initialCoords ? [initialCoords.lat, initialCoords.lng] : [40.4168, -3.7038],
    zoom: initialCoords ? 16 : 15,
    onReady(map) {
      if (initialCoords) {
        const m = L.marker([initialCoords.lat, initialCoords.lng], { icon: newPinIcon(), draggable: true }).addTo(map)
        m.on('dragend', ev => { const p = ev.target.getLatLng(); onLocationPick({ lat: p.lat, lng: p.lng }) })
        markerRef.current = m
      }

      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) markerRef.current.remove()
        const m = L.marker([lat, lng], { icon: newPinIcon(), draggable: true }).addTo(map)
        m.on('dragend', ev => { const p = ev.target.getLatLng(); onLocationPick({ lat: p.lat, lng: p.lng }) })
        markerRef.current = m
        onLocationPick({ lat, lng })
      })
    }
  })

  return (
    <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(26,25,22,0.15)' }}>
      <div ref={containerRef} style={{ width: '100%', height: 180 }} />
      <div style={{
        position: 'absolute', top: 6, left: 6,
        background: 'rgba(26,25,22,0.72)', color: 'white',
        fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 8,
        pointerEvents: 'none',
      }}>
        👆 Toca para marcar la ubicación
      </div>
    </div>
  )
}
