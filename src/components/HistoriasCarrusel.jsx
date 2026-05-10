import { useState, useRef } from 'react'

function Avatar({ profile, size = 52 }) {
  const initials = profile?.display_name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:size*0.3, fontWeight:800, color:'white', overflow:'hidden', flexShrink:0 }}>
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
    </div>
  )
}

export default function HistoriasCarrusel({ historias, userId, onAdd, uploadImage }) {
  const [viewing, setViewing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  // Group by user
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

  return (
    <>
      <div style={{ display:'flex', gap:10, padding:'12px 14px', overflowX:'auto', borderBottom:'1px solid var(--border)', background:'var(--paper)' }}>
        {/* Add story button */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0, cursor:'pointer' }} onClick={() => setAdding(true)}>
          <div style={{ width:52, height:52, borderRadius:'50%', border:'2px dashed var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'var(--gray-400)' }}>+</div>
          <span style={{ fontSize:10, color:'var(--gray-400)', whiteSpace:'nowrap' }}>Tu historia</span>
        </div>

        {groups.map((g, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0, cursor:'pointer' }} onClick={() => setViewing(g)}>
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

      {/* View story modal */}
      {viewing && (
        <div style={{ position:'fixed', inset:0, background:'black', zIndex:400, display:'flex', flexDirection:'column' }} onClick={() => setViewing(null)}>
          <div style={{ position:'relative', flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src={viewing.items[0].image_url} alt="" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} />
            <div style={{ position:'absolute', top:16, left:16, display:'flex', alignItems:'center', gap:8 }}>
              <Avatar profile={viewing.profile} size={36} />
              <div>
                <div style={{ color:'white', fontSize:13, fontWeight:700, fontFamily:'var(--font-display)' }}>{viewing.profile?.display_name}</div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:10 }}>{viewing.items[0].bares?.name}</div>
              </div>
            </div>
            {viewing.items[0].caption && (
              <div style={{ position:'absolute', bottom:32, left:16, right:16, color:'white', fontSize:14, textAlign:'center', background:'rgba(0,0,0,0.5)', padding:'8px 12px', borderRadius:10 }}>
                {viewing.items[0].caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add story modal */}
      {adding && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setAdding(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">Nueva historia</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files[0]; if(!f) return; setFile(f); setPreview(URL.createObjectURL(f)) }} />
            <div onClick={() => fileRef.current.click()} style={{ width:'100%', height:200, border:'1.5px dashed var(--gray-200)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', marginBottom:12 }}>
              {preview ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ textAlign:'center', color:'var(--gray-400)' }}><div style={{ fontSize:36 }}>📸</div><div style={{ fontSize:13, marginTop:6 }}>Toca para añadir foto</div></div>}
            </div>
            <input className="form-input" placeholder="¿Qué está pasando? (opcional)" value={caption} onChange={e => setCaption(e.target.value)} style={{ marginBottom:12 }} />
            <button className="primary-btn" onClick={submitHistoria} disabled={!file || saving}>{saving ? 'Publicando...' : 'Publicar historia'}</button>
            <button className="cancel-lnk" onClick={() => setAdding(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  )
}
