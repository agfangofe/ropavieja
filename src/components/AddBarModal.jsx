import { useState, useRef } from 'react'
import { MiniMapa } from './MapaReal'

export default function AddBarModal({ onAdd, onClose, uploadImage, initialCoords }) {
  const [form, setForm] = useState({ name: '', precio: '', review: '', nota: '' })
  const [stars, setStars] = useState(3)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [coords, setCoords] = useState(initialCoords || null)
  const [locating, setLocating] = useState(false)
  const [searchAddr, setSearchAddr] = useState('')
  const [searchError, setSearchError] = useState('')
  const fileRef = useRef()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function searchAddress() {
    if (!searchAddr.trim()) return
    setLocating(true)
    setSearchError('')
    try {
      const q = encodeURIComponent(searchAddr + ', España')
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
        headers: { 'Accept-Language': 'es' }
      })
      const data = await res.json()
      if (data && data.length > 0) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
        setSearchError('')
      } else {
        setSearchError('No encontré esa dirección. Prueba con más detalle o toca el mapa.')
      }
    } catch(e) {
      setSearchError('Error al buscar. Toca el mapa para marcar manualmente.')
    } finally {
      setLocating(false)
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setSearchError('Tu navegador no soporta geolocalización.'); return }
    setLocating(true)
    setSearchError('')
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      () => { setSearchError('No se pudo obtener tu ubicación. Busca la dirección o toca el mapa.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      let image_url = null
      if (imageFile && uploadImage) image_url = await uploadImage(imageFile)
      await onAdd({ ...form, tapa_score: stars * 2, image_url, lat: coords?.lat ?? null, lng: coords?.lng ?? null })
      onClose()
    } catch(e) { console.error(e) }
    finally { setSaving(false) }
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

        <div className="form-group">
          <label className="form-label">Precio de la caña</label>
          <input className="form-input" placeholder="1.20€" value={form.precio} onChange={e => set('precio', e.target.value)} />
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
          <label className="form-label">Nota personal (0–10)</label>
          <input className="form-input" type="number" min="0" max="10" step="0.5" placeholder="7.5" value={form.nota} onChange={e => set('nota', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            Ubicación
            {coords && <span style={{ fontSize:10, color:'var(--green)', fontWeight:600, background:'var(--green-light)', padding:'2px 7px', borderRadius:8 }}>✓ Marcada</span>}
          </label>

          {/* Address search */}
          <div style={{ display:'flex', gap:6, marginBottom:8 }}>
            <input
              className="form-input"
              placeholder="Busca por dirección o nombre del bar..."
              value={searchAddr}
              onChange={e => setSearchAddr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchAddress()}
              style={{ flex:1 }}
            />
            <button
              onClick={searchAddress}
              disabled={locating || !searchAddr.trim()}
              style={{ background:'var(--ink)', color:'white', border:'none', borderRadius:'var(--radius)', padding:'0 12px', fontSize:13, cursor:'pointer', fontWeight:600, flexShrink:0 }}
            >
              {locating ? '...' : '🔍'}
            </button>
          </div>

          {/* My location button */}
          <button
            onClick={useMyLocation}
            disabled={locating}
            style={{ width:'100%', marginBottom:8, padding:'8px 12px', background:'var(--purple-light)', color:'var(--purple)', border:'1px solid var(--purple)', borderRadius:'var(--radius)', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'var(--font-body)' }}
          >
            {locating ? '📡 Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
          </button>

          {searchError && (
            <div style={{ fontSize:11, color:'var(--red)', marginBottom:8, padding:'6px 10px', background:'var(--red-light)', borderRadius:8 }}>
              {searchError}
            </div>
          )}

          <div style={{ fontSize:11, color:'var(--gray-400)', marginBottom:6, textAlign:'center' }}>— o toca el mapa directamente —</div>

          <MiniMapa onLocationPick={setCoords} initialCoords={coords} />
        </div>

        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
          const f = e.target.files[0]; if (!f) return
          setImageFile(f); setImagePreview(URL.createObjectURL(f))
        }} />
        <div className="upload-zone" onClick={() => fileRef.current.click()}>
          {imagePreview
            ? <img src={imagePreview} alt="" style={{ width:'100%', height:90, objectFit:'cover', borderRadius:8 }} />
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
