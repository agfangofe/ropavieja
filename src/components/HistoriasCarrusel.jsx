import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

function Avatar({ profile, size = 52 }) {
  const initials = profile?.display_name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:size*0.3, fontWeight:800, color:'white', overflow:'hidden', flexShrink:0 }}>
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
    </div>
  )
}

export default function HistoriasCarrusel({ historias, userId, onAdd, uploadImage, onDelete }) {
  const [viewing, setViewing] = useState(null)
  const [viewIdx, setViewIdx] = useState(0)
  const [adding, setAdding] = useState(false)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const byUser = {}
  historias.forEach(h => {
    if (!byUser[h.user_id]) byUser[h.user_id] = { profile: h.profiles, items: [] }
    byUser[h.user_id].items.push(h)
  })
  const groups = Object.values(byUser)

  async function submitHistoria() {
    if (!file) return
    setSaving(true)
    try {
      const url = await uploadImage(file)
      await onAdd({ image_url: url, caption })
      setAdding(false); setCaption(''); setPreview(null); setFile(null)
    } catch(e) { console.error(e) }
    finally { setSaving(false) }
  }

  async function deleteHistoria(historia) {
    if (!confirm('¿Eliminar esta historia?')) return
    await supabase.from('historias').delete().eq('id', historia.id)
    setViewing(null)
    if (onDelete) onDelete()
  }

  const currentHistoria = viewing?.items?.[viewIdx]

  function prevHistoria() { setViewIdx(i => Math.max(0, i-1)) }
  function nextHistoria() { setViewIdx(i => Math.min(viewing.items.length-1, i+1)) }

  return (
    <>
      <div style={{ display:'flex', gap:10, padding:'12px 14px', overflowX:'auto', borderBottom:'1px solid var(--border)', background:'var(--paper)' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0, cursor:'pointer' }} onClick={() => setAdding(true)}>
          <div style={{ width:52, height:52, borderRadius:'50%', border:'2px dashed var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'var(--gray-400)' }}>+</div>
          <span style={{ fontSize:10, color:'var(--gray-400)', whiteSpace:'nowrap' }}>Tu historia</span>
        </div>

        {groups.map((g, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0, cursor:'pointer' }} onClick={() => { setViewing(g); setViewIdx(0) }}>
            <div style={{ padding:2, borderRadius:'50%', background:'linear-gradient(135deg, var(--red), var(--amber))', flexShrink:0 }}>
              <div style={{ padding:2, borderRadius:'50%', background:'var(--paper)' }}>
                <Avatar profile={g.profile} size={48} />
              </div>
            </div>
            <span style={{ fontSize:10, color:'var(--ink)', whiteSpace:'nowrap', maxWidth:60, overflow:'hidden', textOverflow:'ellipsis' }}>
              {g.profile?.display_name?.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Viewer */}
      {viewing && currentHistoria && (
        <div style={{ position:'fixed', inset:0, background:'black', zIndex:400, display:'flex', flexDirection:'column' }}>
          {/* Progress bar */}
          <div style={{ display:'flex', gap:3, padding:'12px 12px 0' }}>
            {viewing.items.map((_, i) => (
              <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= viewIdx ? 'white' : 'rgba(255,255,255,0.35)' }} />
            ))}
          </div>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px' }}>
            <Avatar profile={viewing.profile} size={32} />
            <div>
              <div style={{ color:'white', fontSize:13, fontWeight:700 }}>{viewing.profile?.display_name}</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:10 }}>{currentHistoria.bares?.name || ''}</div>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:10, alignItems:'center' }}>
              {currentHistoria.user_id === userId && (
                <button onClick={() => deleteHistoria(currentHistoria)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', borderRadius:8, padding:'4px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>
                  🗑️ Eliminar
                </button>
              )}
              <button onClick={() => setViewing(null)} style={{ background:'none', border:'none', color:'white', fontSize:22, cursor:'pointer', padding:0 }}>✕</button>
            </div>
          </div>

          {/* Image */}
          <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src={currentHistoria.image_url} alt="" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} />
            {/* Tap areas */}
            <div style={{ position:'absolute', left:0, top:0, width:'40%', height:'100%' }} onClick={prevHistoria} />
            <div style={{ position:'absolute', right:0, top:0, width:'40%', height:'100%' }} onClick={nextHistoria} />
          </div>

          {currentHistoria.caption && (
            <div style={{ padding:'12px 16px 24px', color:'white', fontSize:14, background:'linear-gradient(transparent, rgba(0,0,0,0.7))', textAlign:'center' }}>
              {currentHistoria.caption}
            </div>
          )}
        </div>
      )}

      {/* Add story */}
      {adding && (
        <div className="overlay" onClick={e => e.target===e.currentTarget && setAdding(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">Nueva historia</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files[0]; if(!f) return; setFile(f); setPreview(URL.createObjectURL(f)) }} />
            <div onClick={() => fileRef.current.click()} style={{ width:'100%', height:200, border:'1.5px dashed var(--gray-200)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', marginBottom:12 }}>
              {preview
                ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ textAlign:'center', color:'var(--gray-400)' }}><div style={{ fontSize:36 }}>📸</div><div style={{ fontSize:13, marginTop:6 }}>Toca para añadir foto</div></div>
              }
            </div>
            <input className="form-input" placeholder="¿Qué está pasando? (opcional)" value={caption} onChange={e => setCaption(e.target.value)} style={{ marginBottom:12 }} />
            <button className="primary-btn" onClick={submitHistoria} disabled={!file||saving}>{saving?'Publicando...':'Publicar historia'}</button>
            <button className="cancel-lnk" onClick={() => setAdding(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  )
}
