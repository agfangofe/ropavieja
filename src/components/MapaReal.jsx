import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CARTO = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

// Use CDN images for markers — avoids all bundler path issues
const ICON_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const ICON_2X  = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const SHADOW   = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: ICON_URL, iconRetinaUrl: ICON_2X, shadowUrl: SHADOW })

function customPin(color, emoji) {
  return L.divIcon({
    className: '',
    html: `<div style="text-align:center;line-height:1;">
      <div style="width:34px;height:34px;border-radius:50%;background:${color};
        border:2.5px solid white;display:inline-flex;align-items:center;
        justify-content:center;font-size:16px;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);">${emoji}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;
        border-right:6px solid transparent;border-top:9px solid ${color};
        margin:0 auto;"></div>
    </div>`,
    iconSize: [34, 45],
    iconAnchor: [17, 45],
    popupAnchor: [0, -47],
  })
}

function barPin(bar) {
  return customPin(
    bar.isCrown ? '#D4873A' : bar.isGhost ? '#9E9A92' : '#D94F3D',
    bar.isGhost ? '👻' : bar.isCrown ? '👑' : '🍺'
  )
}

function MapInstance({ height, center, zoom, onMapReady }) {
  const divRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!divRef.current) return
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

    const map = L.map(divRef.current, { center, zoom })
    L.tileLayer(CARTO, { subdomains: 'abcd', maxZoom: 19, attribution: '© OpenStreetMap © CARTO' }).addTo(map)

    // Wait two frames so the browser has painted the container with real px dimensions
    requestAnimationFrame(() => requestAnimationFrame(() => {
      map.invalidateSize()
      mapRef.current = map
      if (onMapReady) onMapReady(map)
    }))

    return () => { map.remove(); mapRef.current = null }
  }, [])

  return <div ref={divRef} style={{ width: '100%', height }} />
}

// ── Tab Mapa ──────────────────────────────────────────────────────────────────
export default function MapaReal({ bares, onAddBar, onCheckin, localCheckins }) {
  const mapRef      = useRef(null)
  const layerRef    = useRef(null)
  const newPinRef   = useRef(null)
  const addingRef   = useRef(false)
  const [adding, setAdding]   = useState(false)
  const [pinPos, setPinPos]   = useState(null)
  const [mapH, setMapH]       = useState(320)

  // Measure available height dynamically
  const wrapRef = useRef(null)
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setMapH(Math.max(200, e.contentRect.height))
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { addingRef.current = adding }, [adding])

  function handleMapReady(map) {
    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)
    renderMarkers()

    map.on('click', e => {
      if (!addingRef.current) return
      const { lat, lng } = e.latlng
      if (newPinRef.current) newPinRef.current.remove()
      const m = L.marker([lat, lng], { icon: customPin('#D94F3D', '📍'), draggable: true }).addTo(map)
      m.on('dragend', ev => { const p = ev.target.getLatLng(); setPinPos({ lat: p.lat, lng: p.lng }) })
      newPinRef.current = m
      setPinPos({ lat, lng })
    })
  }

  function renderMarkers() {
    if (!layerRef.current) return
    layerRef.current.clearLayers()
    bares.forEach(bar => {
      if (!bar.lat || !bar.lng) return
      const visited = bar.userVisited || localCheckins?.[bar.id]
      const m = L.marker([bar.lat, bar.lng], { icon: barPin(bar) })
      m.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:160px;">
          <b style="font-size:14px;color:#1A1916;">${bar.name} ${bar.isCrown?'👑':''} ${bar.isGhost?'👻':''}</b>
          <p style="font-size:11px;color:#9E9A92;margin:3px 0 8px;">${bar.barrio||''}</p>
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">
            ${bar.precio_cana?`<span style="font-size:10px;background:#FDF0E4;color:#D4873A;padding:2px 7px;border-radius:10px;font-weight:600;">🍺 ${bar.precio_cana}</span>`:''}
            <span style="font-size:10px;background:#F5E8E6;color:#9C3327;padding:2px 7px;border-radius:10px;font-weight:600;">★ ${bar.avgScore?bar.avgScore.toFixed(1):'—'}</span>
          </div>
          ${visited
            ? '<p style="font-size:11px;color:#3A7D5B;font-weight:600;margin:0;">✓ Estuviste aquí</p>'
            : `<button id="ci-${bar.id}" style="font-size:11px;background:#EEEAF8;color:#6B5EA8;border:none;border-radius:8px;padding:5px 10px;cursor:pointer;font-weight:600;width:100%;">📍 Estuve aquí</button>`}
        </div>`)
      m.on('popupopen', () => {
        const btn = document.getElementById(`ci-${bar.id}`)
        if (btn) btn.onclick = () => { onCheckin(bar.id); m.closePopup() }
      })
      layerRef.current.addLayer(m)
    })
  }

  useEffect(() => { renderMarkers() }, [bares, localCheckins])

  function toggleAdding() {
    if (adding) {
      if (newPinRef.current) { newPinRef.current.remove(); newPinRef.current = null }
      setPinPos(null)
    }
    setAdding(p => !p)
  }

  function confirm() {
    if (!pinPos) return
    onAddBar(pinPos)
    if (newPinRef.current) { newPinRef.current.remove(); newPinRef.current = null }
    setPinPos(null)
    setAdding(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* Map area grows to fill available space */}
      <div ref={wrapRef} style={{ flex:1, position:'relative', minHeight:200 }}>
        <MapInstance
          height={mapH}
          center={[40.4168, -3.7038]}
          zoom={15}
          onMapReady={handleMapReady}
        />

        {adding && (
          <div style={{
            position:'absolute', top:12, left:'50%', transform:'translateX(-50%)',
            background:'rgba(26,25,22,0.85)', color:'white', fontSize:12, fontWeight:600,
            padding:'7px 14px', borderRadius:20, zIndex:1000, whiteSpace:'nowrap', pointerEvents:'none',
          }}>
            👆 Toca el mapa para fijar el bar
          </div>
        )}

        <button onClick={toggleAdding} style={{
          position:'absolute', bottom:14, right:14, zIndex:1000,
          width:46, height:46, borderRadius:'50%',
          background: adding ? '#5C5852' : '#D94F3D',
          border:'none', cursor:'pointer', fontSize:22, color:'white',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 3px 12px rgba(0,0,0,0.3)', transition:'background 0.2s',
        }}>
          {adding ? '✕' : '+'}
        </button>
      </div>

      {/* Confirm pin */}
      {pinPos && adding && (
        <div style={{ background:'#FDFCFA', borderTop:'1px solid rgba(26,25,22,0.1)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:13, color:'#1A1916' }}>📍 Ubicación marcada</div>
            <div style={{ fontSize:11, color:'#9E9A92', marginTop:2 }}>Arrastra el pin para ajustar</div>
          </div>
          <button onClick={confirm} style={{ background:'#D94F3D', color:'white', border:'none', borderRadius:10, padding:'9px 18px', cursor:'pointer', fontSize:13, fontWeight:700 }}>
            Continuar →
          </button>
        </div>
      )}

      {/* Bar list */}
      <div style={{ background:'#FDFCFA', padding:'10px 14px', borderTop:'1px solid rgba(26,25,22,0.1)' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#9E9A92', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
          {bares.filter(b=>b.lat&&b.lng).length} de {bares.length} bares en el mapa
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:130, overflowY:'auto' }}>
          {bares.map(bar => (
            <div key={bar.id}
              onClick={() => bar.lat && mapRef.current?.setView([bar.lat, bar.lng], 17)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', background:'#F7F6F4', border:'1px solid rgba(26,25,22,0.1)', borderRadius:10, cursor: bar.lat?'pointer':'default', opacity: bar.lat?1:0.5 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: bar.isCrown?'#D4873A': bar.isGhost?'#9E9A92':'#D94F3D', flexShrink:0 }} />
              <span style={{ fontSize:13, fontWeight:700, color:'#1A1916', flex:1 }}>{bar.name} {bar.isCrown?'👑':''}{bar.isGhost?'👻':''}</span>
              <span style={{ fontSize:11, color:'#9E9A92' }}>{bar.lat ? `★ ${bar.avgScore?bar.avgScore.toFixed(1):'—'}` : 'sin ubicación'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Mini mapa para el formulario ──────────────────────────────────────────────
export function MiniMapa({ onLocationPick, initialCoords }) {
  const markerRef = useRef(null)

  function handleReady(map) {
    if (initialCoords) {
      const m = L.marker([initialCoords.lat, initialCoords.lng], { icon: customPin('#D94F3D','📍'), draggable:true }).addTo(map)
      m.on('dragend', ev => { const p = ev.target.getLatLng(); onLocationPick({ lat:p.lat, lng:p.lng }) })
      markerRef.current = m
    }
    map.on('click', e => {
      const { lat, lng } = e.latlng
      if (markerRef.current) markerRef.current.remove()
      const m = L.marker([lat, lng], { icon: customPin('#D94F3D','📍'), draggable:true }).addTo(map)
      m.on('dragend', ev => { const p = ev.target.getLatLng(); onLocationPick({ lat:p.lat, lng:p.lng }) })
      markerRef.current = m
      onLocationPick({ lat, lng })
    })
  }

  return (
    <div style={{ position:'relative', borderRadius:10, overflow:'hidden', border:'1px solid rgba(26,25,22,0.15)' }}>
      <MapInstance
        height={180}
        center={initialCoords ? [initialCoords.lat, initialCoords.lng] : [40.4168, -3.7038]}
        zoom={initialCoords ? 16 : 15}
        onMapReady={handleReady}
      />
      <div style={{
        position:'absolute', top:6, left:6, zIndex:500,
        background:'rgba(26,25,22,0.75)', color:'white',
        fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:8, pointerEvents:'none',
      }}>
        👆 Toca para marcar la ubicación
      </div>
    </div>
  )
}
