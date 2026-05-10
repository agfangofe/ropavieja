import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function pinIcon(bar) {
  const color = bar.isCrown ? '#D4873A' : bar.isGhost ? '#9E9A92' : '#D94F3D'
  const emoji = bar.isGhost ? '👻' : bar.isCrown ? '👑' : '🍺'
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:34px;height:34px;border-radius:50%;background:${color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${emoji}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ${color};margin-top:-1px;"></div>
    </div>`,
    iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -46],
  })
}

function newPin() {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:38px;height:38px;border-radius:50%;background:#D94F3D;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 3px 14px rgba(217,79,61,0.5);">📍</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid #D94F3D;margin-top:-1px;"></div>
    </div>`,
    iconSize: [38, 50], iconAnchor: [19, 50], popupAnchor: [0, -52],
  })
}

export default function MapaReal({ bares, onAddBar, onCheckin, localCheckins }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const newMarkerRef = useRef(null)
  const addingRef = useRef(false)
  const [adding, setAdding] = useState(false)
  const [pinPos, setPinPos] = useState(null)

  useEffect(() => { addingRef.current = adding }, [adding])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, { center: [40.4168, -3.7038], zoom: 15 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    // Critical: force Leaflet to recalculate size after mount
    setTimeout(() => map.invalidateSize(), 100)

    map.on('click', (e) => {
      if (!addingRef.current) return
      const { lat, lng } = e.latlng
      if (newMarkerRef.current) newMarkerRef.current.remove()
      const m = L.marker([lat, lng], { icon: newPin(), draggable: true }).addTo(map)
      m.on('dragend', ev => { const p = ev.target.getLatLng(); setPinPos({ lat: p.lat, lng: p.lng }) })
      newMarkerRef.current = m
      setPinPos({ lat, lng })
    })

    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return
    layerRef.current.clearLayers()
    bares.forEach(bar => {
      if (!bar.lat || !bar.lng) return
      const visited = bar.userVisited || localCheckins?.[bar.id]
      const m = L.marker([bar.lat, bar.lng], { icon: pinIcon(bar) })
      m.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:150px;">
          <div style="font-size:14px;font-weight:700;color:#1A1916;margin-bottom:3px;">${bar.name} ${bar.isCrown?'👑':''} ${bar.isGhost?'👻':''}</div>
          <div style="font-size:11px;color:#9E9A92;margin-bottom:7px;">${bar.barrio||''}</div>
          <div style="display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap;">
            ${bar.precio_cana?`<span style="font-size:10px;background:#FDF0E4;color:#D4873A;padding:2px 7px;border-radius:10px;font-weight:600;">🍺 ${bar.precio_cana}</span>`:''}
            <span style="font-size:10px;background:#F5E8E6;color:#9C3327;padding:2px 7px;border-radius:10px;font-weight:600;">★ ${bar.avgScore?bar.avgScore.toFixed(1):'—'}</span>
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

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <div style={{ position:'relative', flex:1, minHeight:0 }}>
        <div
          ref={containerRef}
          style={{ width:'100%', height:'100%', position:'absolute', inset:0 }}
        />
        {adding && (
          <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', background:'#1A1916', color:'white', fontSize:12, fontWeight:600, padding:'8px 16px', borderRadius:20, zIndex:1000, whiteSpace:'nowrap', pointerEvents:'none' }}>
            👆 Toca el mapa para marcar la ubicación
          </div>
        )}
        <button onClick={toggleAdding} style={{ position:'absolute', bottom:16, right:16, zIndex:1000, width:46, height:46, borderRadius:'50%', background:adding?'#5C5852':'#D94F3D', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(0,0,0,0.3)', fontSize:22, color:'white', transition:'background 0.2s' }}>
          {adding ? '✕' : '+'}
        </button>
      </div>

      {pinPos && adding && (
        <div style={{ background:'#FDFCFA', borderTop:'1px solid rgba(26,25,22,0.1)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:13, color:'#1A1916' }}>📍 Ubicación marcada</div>
            <div style={{ fontSize:11, color:'#9E9A92', marginTop:2 }}>Arrastra el pin para ajustar</div>
          </div>
          <button onClick={confirm} style={{ background:'#D94F3D', color:'white', border:'none', borderRadius:10, padding:'9px 18px', cursor:'pointer', fontSize:13, fontWeight:700, flexShrink:0 }}>
            Continuar →
          </button>
        </div>
      )}

      <div style={{ background:'#FDFCFA', padding:'12px 14px', borderTop:'1px solid rgba(26,25,22,0.1)' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#9E9A92', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
          {bares.filter(b=>b.lat&&b.lng).length} de {bares.length} bares en el mapa
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:150, overflowY:'auto' }}>
          {bares.map(bar => (
            <div key={bar.id} onClick={() => bar.lat && mapRef.current?.setView([bar.lat, bar.lng], 17)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', background:'#F7F6F4', border:'1px solid rgba(26,25,22,0.1)', borderRadius:10, cursor:bar.lat?'pointer':'default', opacity:bar.lat?1:0.5 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background:bar.isCrown?'#D4873A':bar.isGhost?'#9E9A92':'#D94F3D' }} />
              <span style={{ fontSize:13, fontWeight:700, color:'#1A1916', flex:1 }}>{bar.name} {bar.isCrown?'👑':''}{bar.isGhost?'👻':''}</span>
              <span style={{ fontSize:11, color:'#9E9A92' }}>{bar.lat?`★ ${bar.avgScore?bar.avgScore.toFixed(1):'—'}`:'sin ubicación'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
