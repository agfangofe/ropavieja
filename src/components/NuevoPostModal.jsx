import { useState, useRef } from 'react'

export default function NuevoPostModal({ onPost, onClose, uploadImage }) {
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  async function submit() {
    if (!text.trim() && !imageFile) return
    setSaving(true)
    try {
      let image_url = null
      if (imageFile && uploadImage) image_url = await uploadImage(imageFile)
      await onPost({ text: text.trim(), image_url })
      onClose()
    } catch(e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Nueva publicación</div>

        <textarea
          className="form-input"
          rows={4}
          placeholder="¿Qué está pasando en el barrio?"
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ marginBottom: 12, resize: 'none' }}
          autoFocus
        />

        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
          const f = e.target.files[0]; if (!f) return
          setImageFile(f); setPreview(URL.createObjectURL(f))
        }} />

        {preview
          ? (
            <div style={{ position:'relative', marginBottom:12 }}>
              <img src={preview} alt="" style={{ width:'100%', height:160, objectFit:'cover', borderRadius:10 }} />
              <button onClick={() => { setImageFile(null); setPreview(null) }} style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.6)', border:'none', color:'white', borderRadius:'50%', width:26, height:26, cursor:'pointer', fontSize:14 }}>✕</button>
            </div>
          )
          : (
            <button onClick={() => fileRef.current.click()} style={{ width:'100%', padding:'10px', border:'1.5px dashed var(--gray-200)', borderRadius:'var(--radius)', background:'none', cursor:'pointer', fontSize:13, color:'var(--gray-400)', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              📷 Añadir foto
            </button>
          )
        }

        <button className="primary-btn" onClick={submit} disabled={saving || (!text.trim() && !imageFile)}>
          {saving ? 'Publicando...' : 'Publicar'}
        </button>
        <button className="cancel-lnk" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
