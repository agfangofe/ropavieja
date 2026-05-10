import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

// Inject Leaflet CSS inline to avoid bundler issues
const LEAFLET_CSS = ".leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0;}.leaflet-container{overflow:hidden;}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none;}.leaflet-tile::selection{background:transparent;}.leaflet-safari .leaflet-tile{image-rendering:-webkit-optimize-contrast;}.leaflet-safari .leaflet-tile-container{width:1600px;height:1600px;-webkit-transform-origin:0 0;}.leaflet-marker-icon,.leaflet-marker-shadow{display:block;}.leaflet-container .leaflet-overlay-pane svg{max-width:none !important;max-height:none !important;}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer,.leaflet-container .leaflet-tile{max-width:none !important;max-height:none !important;width:auto;padding:0;}.leaflet-container img.leaflet-tile{mix-blend-mode:plus-lighter;}.leaflet-container.leaflet-touch-zoom{-ms-touch-action:pan-x pan-y;touch-action:pan-x pan-y;}.leaflet-container.leaflet-touch-drag{-ms-touch-action:pinch-zoom;touch-action:none;touch-action:pinch-zoom;}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{-ms-touch-action:none;touch-action:none;}.leaflet-container{-webkit-tap-highlight-color:transparent;}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,0.4);}.leaflet-tile{filter:inherit;visibility:hidden;}.leaflet-tile-loaded{visibility:inherit;}.leaflet-zoom-box{width:0;height:0;-moz-box-sizing:border-box;box-sizing:border-box;z-index:800;}.leaflet-overlay-pane svg{-moz-user-select:none;}.leaflet-pane{z-index:400;}.leaflet-tile-pane{z-index:200;}.leaflet-overlay-pane{z-index:400;}.leaflet-shadow-pane{z-index:500;}.leaflet-marker-pane{z-index:600;}.leaflet-tooltip-pane{z-index:650;}.leaflet-popup-pane{z-index:700;}.leaflet-map-pane canvas{z-index:100;}.leaflet-map-pane svg{z-index:200;}.leaflet-vml-shape{width:1px;height:1px;}.lvml{behavior:url(#default#VML);display:inline-block;position:absolute;}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto;}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none;}.leaflet-top{top:0;}.leaflet-right{right:0;}.leaflet-bottom{bottom:0;}.leaflet-left{left:0;}.leaflet-control{float:left;clear:both;}.leaflet-right .leaflet-control{float:right;}.leaflet-top .leaflet-control{margin-top:10px;}.leaflet-bottom .leaflet-control{margin-bottom:10px;}.leaflet-left .leaflet-control{margin-left:10px;}.leaflet-right .leaflet-control{margin-right:10px;}.leaflet-fade-anim .leaflet-popup{opacity:0;-webkit-transition:opacity 0.2s linear;-moz-transition:opacity 0.2s linear;transition:opacity 0.2s linear;}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1;}.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0;}svg.leaflet-zoom-animated{will-change:transform;}.leaflet-zoom-anim .leaflet-zoom-animated{-webkit-transition:-webkit-transform 0.25s cubic-bezier(0,0,0.25,1);-moz-transition:-moz-transform 0.25s cubic-bezier(0,0,0.25,1);transition:transform 0.25s cubic-bezier(0,0,0.25,1);}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none;}.leaflet-zoom-anim .leaflet-zoom-hide{visibility:hidden;}.leaflet-interactive{cursor:pointer;}.leaflet-grab{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab;}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair;}.leaflet-popup-pane,.leaflet-control{cursor:auto;}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing;}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-image-layer,.leaflet-pane>svg path,.leaflet-tile-container{pointer-events:none;}.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane>svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto;}.leaflet-container{background:#ddd;outline-offset:1px;}.leaflet-container a{color:#0078A8;}.leaflet-zoom-box{border:2px dotted #38f;background:rgba(255,255,255,0.5);}.leaflet-container{font-family:\"Helvetica Neue\",Arial,Helvetica,sans-serif;font-size:12px;font-size:0.75rem;line-height:1.5;}.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,0.65);border-radius:4px;}.leaflet-bar a{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:black;}.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block;}.leaflet-bar a:hover,.leaflet-bar a:focus{background-color:#f4f4f4;}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px;}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none;}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb;}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px;}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px;}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px;}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px 'Lucida Console',Monaco,monospace;text-indent:1px;}.leaflet-touch .leaflet-control-zoom-in,.leaflet-touch .leaflet-control-zoom-out{font-size:22px;}.leaflet-control-layers{box-shadow:0 1px 5px rgba(0,0,0,0.4);background:#fff;border-radius:5px;}.leaflet-control-layers-toggle{background-image:url(images/layers.png);width:36px;height:36px;}.leaflet-retina .leaflet-control-layers-toggle{background-image:url(images/layers-2x.png);background-size:26px 26px;}.leaflet-touch .leaflet-control-layers-toggle{width:44px;height:44px;}.leaflet-control-layers .leaflet-control-layers-list,.leaflet-control-layers-expanded .leaflet-control-layers-toggle{display:none;}.leaflet-control-layers-expanded .leaflet-control-layers-list{display:block;position:relative;}.leaflet-control-layers-expanded{padding:6px 10px 6px 6px;color:#333;background:#fff;}.leaflet-control-layers-scrollbar{overflow-y:scroll;overflow-x:hidden;padding-right:5px;}.leaflet-control-layers-selector{margin-top:2px;position:relative;top:1px;}.leaflet-control-layers label{display:block;font-size:13px;font-size:1.08333em;}.leaflet-control-layers-separator{height:0;border-top:1px solid #ddd;margin:5px -10px 5px -6px;}.leaflet-default-icon-path{background-image:url(images/marker-icon.png);}.leaflet-container .leaflet-control-attribution{background:#fff;background:rgba(255,255,255,0.8);margin:0;}.leaflet-control-attribution,.leaflet-control-scale-line{padding:0 5px;color:#333;line-height:1.4;}.leaflet-control-attribution a{text-decoration:none;}.leaflet-control-attribution a:hover,.leaflet-control-attribution a:focus{text-decoration:underline;}.leaflet-attribution-flag{display:inline !important;vertical-align:baseline !important;width:1em;height:0.6669em;}.leaflet-left .leaflet-control-scale{margin-left:5px;}.leaflet-bottom .leaflet-control-scale{margin-bottom:5px;}.leaflet-control-scale-line{border:2px solid #777;border-top:none;line-height:1.1;padding:2px 5px 1px;white-space:nowrap;-moz-box-sizing:border-box;box-sizing:border-box;background:rgba(255,255,255,0.8);text-shadow:1px 1px #fff;}.leaflet-control-scale-line:not(:first-child){border-top:2px solid #777;border-bottom:none;margin-top:-2px;}.leaflet-control-scale-line:not(:first-child):not(:last-child){border-bottom:2px solid #777;}.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{box-shadow:none;}.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{border:2px solid rgba(0,0,0,0.2);background-clip:padding-box;}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px;}.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px;}.leaflet-popup-content{margin:13px 24px 13px 20px;line-height:1.3;font-size:13px;font-size:1.08333em;min-height:1px;}.leaflet-popup-content p{margin:17px 0;margin:1.3em 0;}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-top:-1px;margin-left:-20px;overflow:hidden;pointer-events:none;}.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;pointer-events:auto;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg);}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:white;color:#333;box-shadow:0 3px 14px rgba(0,0,0,0.4);}.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;border:none;text-align:center;width:24px;height:24px;font:16px/24px Tahoma,Verdana,sans-serif;color:#757575;text-decoration:none;background:transparent;}.leaflet-container a.leaflet-popup-close-button:hover,.leaflet-container a.leaflet-popup-close-button:focus{color:#585858;}.leaflet-popup-scrolled{overflow:auto;}.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1;}.leaflet-oldie .leaflet-popup-tip{width:24px;margin:0 auto;-ms-filter:\"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678,M12=0.70710678,M21=-0.70710678,M22=0.70710678)\";filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678,M12=0.70710678,M21=-0.70710678,M22=0.70710678);}.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-popup-content-wrapper,.leaflet-oldie .leaflet-popup-tip{border:1px solid #999;}.leaflet-div-icon{background:#fff;border:1px solid #666;}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.4);}.leaflet-tooltip.leaflet-interactive{cursor:pointer;pointer-events:auto;}.leaflet-tooltip-top:before,.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:\"\";}.leaflet-tooltip-bottom{margin-top:6px;}.leaflet-tooltip-top{margin-top:-6px;}.leaflet-tooltip-bottom:before,.leaflet-tooltip-top:before{left:50%;margin-left:-6px;}.leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff;}.leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff;}.leaflet-tooltip-left{margin-left:-6px;}.leaflet-tooltip-right{margin-left:6px;}.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{top:50%;margin-top:-6px;}.leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff;}.leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff;}@media print{.leaflet-control{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}";
if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
  const style = document.createElement('style');
  style.id = 'leaflet-css';
  style.textContent = LEAFLET_CSS;
  document.head.appendChild(style);
}

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeBarIcon(bar) {
  const color = bar.isCrown ? '#D4873A' : bar.isGhost ? '#9E9A92' : '#D94F3D'
  const emoji = bar.isGhost ? '👻' : bar.isCrown ? '👑' : '🍺'
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:34px;height:34px;border-radius:50%;background:${color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${emoji}</div>
      <div style="background:white;border:1px solid ${color};border-radius:6px;padding:1px 5px;font-size:9px;font-weight:700;margin-top:2px;white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis;color:#1A1916;">${bar.name}</div>
    </div>`,
    iconSize: [34, 56],
    iconAnchor: [17, 56],
    popupAnchor: [0, -58],
  })
}

function MapBox({ heightPx, onReady }) {
  const ref = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!ref.current || map.current) return
    const m = L.map(ref.current).setView([40.4168, -3.7038], 15)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(m)
    map.current = m
    setTimeout(() => { m.invalidateSize(); if (onReady) onReady(m) }, 300)
    return () => { m.remove(); map.current = null }
  }, [])

  return <div ref={ref} style={{ width: '100%', height: heightPx + 'px' }} />
}

export default function MapaReal({ bares, onAddBar, onCheckin, localCheckins, onBarClick }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const pinRef = useRef(null)
  const addingRef = useRef(false)
  const [adding, setAdding] = useState(false)
  const [pinPos, setPinPos] = useState(null)
  const [height, setHeight] = useState(300)
  const wrapRef = useRef(null)

  useEffect(() => {
    function measure() {
      if (wrapRef.current) {
        const h = window.innerHeight - 220
        setHeight(Math.max(200, h))
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => { addingRef.current = adding }, [adding])

  function onReady(m) {
    mapRef.current = m
    layerRef.current = L.layerGroup().addTo(m)
    updateMarkers(m)
    m.on('click', (e) => {
      if (!addingRef.current) return
      const { lat, lng } = e.latlng
      if (pinRef.current) pinRef.current.remove()
      const mk = L.marker([lat, lng], { draggable: true }).addTo(m)
      mk.on('dragend', ev => {
        const p = ev.target.getLatLng()
        setPinPos({ lat: p.lat, lng: p.lng })
      })
      pinRef.current = mk
      setPinPos({ lat, lng })
    })
  }

  function updateMarkers(m) {
    if (!layerRef.current) return
    layerRef.current.clearLayers()
    const map = m || mapRef.current
    if (!map) return
    bares.forEach(bar => {
      if (!bar.lat || !bar.lng) return
      const visited = bar.userVisited || localCheckins?.[bar.id]
      const mk = L.marker([bar.lat, bar.lng], { icon: makeBarIcon(bar) })
      mk.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:160px;">
          <b style="font-size:14px;color:#1A1916;">${bar.name}</b><br/>
          <span style="font-size:11px;color:#9E9A92;">${bar.barrio || ''}</span><br/>
          <div style="display:flex;gap:5px;margin:6px 0;flex-wrap:wrap;">
            ${bar.precio_cana ? `<span style="font-size:10px;background:#FDF0E4;color:#D4873A;padding:2px 7px;border-radius:10px;font-weight:600;">🍺 ${bar.precio_cana}</span>` : ''}
            <span style="font-size:10px;background:#F5E8E6;color:#9C3327;padding:2px 7px;border-radius:10px;font-weight:600;">★ ${bar.avgScore ? bar.avgScore.toFixed(1) : '—'}</span>
          </div>
          <div style="display:flex;gap:6px;margin-top:4px;">
            <button id="detail-${bar.id}" style="flex:1;padding:5px 8px;background:#1A1916;color:white;border:none;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;">Ver detalle</button>
            ${!visited ? `<button id="ci-${bar.id}" style="flex:1;padding:5px 8px;background:#EEEAF8;color:#6B5EA8;border:none;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;">Estuve aquí</button>` : '<span style="font-size:11px;color:#3A7D5B;font-weight:600;padding:5px 0;">✓ Estuviste</span>'}
          </div>
        </div>
      `)
      mk.on('popupopen', () => {
        const btn = document.getElementById('ci-' + bar.id)
        if (btn) btn.onclick = () => { onCheckin(bar.id); mk.closePopup() }
        const detailBtn = document.getElementById('detail-' + bar.id)
        if (detailBtn) detailBtn.onclick = () => { mk.closePopup(); if (onBarClick) onBarClick(bar) }
      })
      layerRef.current.addLayer(mk)
    })
  }

  useEffect(() => { updateMarkers() }, [bares, localCheckins])

  function toggleAdding() {
    if (adding) {
      if (pinRef.current) { pinRef.current.remove(); pinRef.current = null }
      setPinPos(null)
    }
    setAdding(p => !p)
  }

  function confirm() {
    if (!pinPos) return
    onAddBar(pinPos)
    if (pinRef.current) { pinRef.current.remove(); pinRef.current = null }
    setPinPos(null)
    setAdding(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <MapBox heightPx={height} onReady={onReady} />
        {adding && (
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, zIndex: 1000, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            👆 Toca el mapa para marcar el bar
          </div>
        )}
        <button onClick={toggleAdding} style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 1000, width: 44, height: 44, borderRadius: '50%', background: adding ? '#666' : '#D94F3D', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {adding ? '✕' : '+'}
        </button>
        <button onClick={() => {
          if (!navigator.geolocation || !mapRef.current) return
          navigator.geolocation.getCurrentPosition(pos => {
            mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 17)
          }, () => alert('No se pudo obtener tu ubicación'))
        }} style={{ position:'absolute', bottom:14, left:14, zIndex:1000, background:'white', border:'none', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.2)', color:'#1A1916', display:'flex', alignItems:'center', gap:5 }}>
          📍 Mi ubicación
        </button>
      </div>

      {pinPos && adding && (
        <div style={{ background: '#fff', borderTop: '1px solid #eee', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>📍 Ubicación marcada</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Arrastra el pin para ajustar</div>
          </div>
          <button onClick={confirm} style={{ background: '#D94F3D', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Continuar →
          </button>
        </div>
      )}

      <div style={{ padding: '10px 14px', borderTop: '1px solid #eee', background: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          {bares.filter(b => b.lat && b.lng).length} de {bares.length} bares en el mapa
        </div>
        <div style={{ maxHeight: 130, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {bares.map(bar => (
            <div key={bar.id} onClick={() => bar.lat && mapRef.current?.setView([bar.lat, bar.lng], 17)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#f7f7f5', border: '1px solid #eee', borderRadius: 10, cursor: bar.lat ? 'pointer' : 'default', opacity: bar.lat ? 1 : 0.5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: bar.isCrown ? '#D4873A' : bar.isGhost ? '#999' : '#D94F3D', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{bar.name} {bar.isCrown ? '👑' : ''}{bar.isGhost ? '👻' : ''}</span>
              <span style={{ fontSize: 11, color: '#999' }}>{bar.lat ? `★ ${bar.avgScore ? bar.avgScore.toFixed(1) : '—'}` : 'sin ubicación'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MiniMapa({ onLocationPick, initialCoords }) {
  const mapRef = useRef(null)
  const pinRef = useRef(null)

  function onReady(m) {
    mapRef.current = m
    if (initialCoords) {
      const mk = L.marker([initialCoords.lat, initialCoords.lng], { draggable: true }).addTo(m)
      mk.on('dragend', ev => { const p = ev.target.getLatLng(); onLocationPick({ lat: p.lat, lng: p.lng }) })
      pinRef.current = mk
    }
    m.on('click', e => {
      const { lat, lng } = e.latlng
      if (pinRef.current) pinRef.current.remove()
      const mk = L.marker([lat, lng], { draggable: true }).addTo(m)
      mk.on('dragend', ev => { const p = ev.target.getLatLng(); onLocationPick({ lat: p.lat, lng: p.lng }) })
      pinRef.current = mk
      onLocationPick({ lat, lng })
    })
  }

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
      <MapBox
        heightPx={180}
        onReady={onReady}
      />
      <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 999, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 8, pointerEvents: 'none' }}>
        👆 Toca para marcar la ubicación
      </div>
    </div>
  )
}
