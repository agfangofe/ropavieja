import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function GaleriaBar({ barId, fotos, userId, uploadImage, onRefresh }) {
  const [uploading, setUploading] = useState(false)
  const [viewing, setViewing] = useState(null)
  const fileRef = useRef()

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      await supabase.from('bar_fotos').insert({ bar_id: barId, user_id: userId, image_url: url })
      onRefresh()
    } catch(err) { console.error(err) }
    finally { setUploading(false) }
  }

  async function deletePhoto(foto) {
    if (foto.user_id !== userId) return
    await supabase.from('bar_fotos').delete().eq('id', foto.id)
    onRefresh()
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:1 }}>
          Galería · {fotos?.length || 0} fotos
        </span>
        <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ fontSize:11, fontWeight:600, background:'var(--red-light)', color:'var(--red)', border:'none', borderRadius:8, padding:'4px 10px', cursor:'pointer' }}>
          {uploading ? 'Subiendo...' : '+ Añadir foto'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleUpload} />
      </div>

      {(!fotos || fotos.length === 0) && (
        <div style={{ padding:'16px 0', textAlign:'center', color:'var(--gray-400)', fontSize:12 }}>
          Sé el primero en subir una foto de este bar
        </div>
      )}

      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
        {fotos?.map(foto => (
          <div key={foto.id} style={{ position:'relative', flexShrink:0, cursor:'pointer' }} onClick={() => setViewing(foto)}>
            <img src={foto.image_url} alt="" style={{ width:90, height:90, objectFit:'cover', borderRadius:10, display:'block' }} />
            {foto.user_id === userId && (
              <button onClick={e => { e.stopPropagation(); deletePhoto(foto) }} style={{ position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', color:'white', fontSize:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            )}
          </div>
        ))}
      </div>

      {viewing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setViewing(null)}>
          <img src={viewing.image_url} alt="" style={{ maxWidth:'95%', maxHeight:'90vh', objectFit:'contain', borderRadius:12 }} />
        </div>
      )}
    </div>
  )
}
