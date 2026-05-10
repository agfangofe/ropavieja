import { useState, useRef, useEffect } from 'react'
import L from 'leaflet'

function miniPinIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:32px;height:32px;border-radius:50%;background:#D94F3D;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(217,79,61,0.5);">📍</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid #D94F3D;margin-top:-1px;"></div>
    </div>`,
    iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -44],
  })
}

function MiniMapa({ onLocationPick, initialCoords }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const center = initialCoords
      ? [initialCoords.lat, initialCoords.lng]
      : [40.4168, -3.7038]

    const map = L.map(containerRef.current, {
      center,
      zoom: initialCoords ? 16 : 15,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // If we already have coords, show marker
    if (initialCoords) {
      const m = L.marker([initialCoords.lat, initialCoords.lng], {
        icon: miniPinIcon(), draggable: true,
      }).addTo(map)
      m.on('dragend', ev => {
        const p = ev.target.getLatLng()
        onLocationPick({ lat: p.lat, lng: p.lng })
      })
      markerRef.current = m
    }

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      if (markerRef.current) markerRef.current.remove()
      const m = L.marker([lat, lng], { icon: miniPinIcon(), draggable: true }).addTo(map)
      m.on('dragend', ev => {
        const p = ev.target.getLatLng()
        onLocationPick({ lat: p.lat, lng: p.lng })
      })
      markerRef.current = m
      onLocationPick({ lat, lng })
    })

    setTimeout(() => map.invalidateSize(), 100)
    mapRef.current = map

    return () => { map.remove(); mapRef.current = null }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: 180, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(26,25,22,0.15)' }}
      />
      <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(26,25,22,0.75)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 8, pointerEvents: 'none' }}>
        Toca para marcar la ubicación
      </div>
    </div>
  )
}

export default function AddBarModal({ onAdd, onClose, uploadImage, initialCoords }) {
  const [form, setForm] = useState({ name: '', barrio: '', precio: '', review: '', nota: '' })
  const [stars, setStars] = useState(3)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [coords, setCoords] = useState(initialCoords || null)
  const fileRef = useRef()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      let image_url = null
      if (imageFile && uploadImage) image_url = await uploadImage(imageFile)
      await onAdd({
        ...form,
        tapa_score: stars * 2,
        image_url,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      })
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Añadir un bar</div>

        <div className="form-group">
          <label className="form-label">Nombre del bar *</label>
          <input className="form-input" placeholder="Ej: Bar Manolo" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="form-2col">
          <div className="form-group">
            <label className="form-label">Precio de la caña</label>
            <input className="form-input" placeholder="1.20€" value={form.precio} onChange={e => set('precio', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Barrio</label>
            <input className="form-input" placeholder="Lavapiés" value={form.barrio} onChange={e => set('barrio', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Calidad de la tapa</label>
          <div className="star-row">
            {[1,2,3,4,5].map(n => (
              <button key={n} className={`star-b${stars >= n ? ' on' : ''}`} onClick={() => setStars(n)}>★</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Reseña pública</label>
          <input className="form-input" placeholder="Cuéntale al grupo qué tal está..." value={form.review} onChange={e => set('review', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Nota personal (privada, 0–10)</label>
          <input className="form-input" type="number" min="0" max="10" step="0.5" placeholder="7.5" value={form.nota} onChange={e => set('nota', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Ubicación en el mapa
            {coords && <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, background: 'var(--green-light)', padding: '2px 7px', borderRadius: 8 }}>✓ Marcada</span>}
          </label>
          <MiniMapa onLocationPick={setCoords} initialCoords={initialCoords} />
        </div>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
        <div className="upload-zone" onClick={() => fileRef.current.click()}>
          {imagePreview
            ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} />
            : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11zM12 17a4 4 0 100-8 4 4 0 000 8z"/></svg> Subir foto del bar</>
          }
        </div>

        <button className="primary-btn" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
          {saving ? 'Guardando...' : 'Añadir al ranking'}
        </button>
        <button className="cancel-lnk" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
