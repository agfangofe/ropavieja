import { useState } from 'react'

function timeStr(dt) {
  const d = new Date(dt)
  return d.toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short' }) + ' · ' + d.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })
}

function initials(name) {
  return name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?'
}

export default function QuedadasPanel({ quedadas, userId, bares, onCreateQuedada, onToggleAsistencia, onDeleteQuedada }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', bar_id:'', date:'', time:'' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function submit() {
    if (!form.title.trim() || !form.date || !form.time) return
    setSaving(true)
    try {
      const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString()
      await onCreateQuedada({ title: form.title, description: form.description, bar_id: form.bar_id || null, scheduled_at })
      setShowForm(false)
      setForm({ title:'', description:'', bar_id:'', date:'', time:'' })
    } catch(e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding:'12px 12px 0' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:1 }}>📅 Quedadas</span>
        <button onClick={() => setShowForm(p=>!p)} style={{ background:'var(--red)', color:'white', border:'none', borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)' }}>
          {showForm ? 'Cancelar' : '+ Proponer'}
        </button>
      </div>

      {showForm && (
        <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius)', padding:12, marginBottom:12, border:'1px solid var(--border)' }}>
          <div className="form-group">
            <label className="form-label">Título *</label>
            <input className="form-input" placeholder="Cañas del viernes" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="form-2col">
            <div className="form-group">
              <label className="form-label">Fecha *</label>
              <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hora *</label>
              <input className="form-input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bar (opcional)</label>
            <select className="form-input" value={form.bar_id} onChange={e => set('bar_id', e.target.value)}>
              <option value="">Sin bar concreto</option>
              {bares.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input className="form-input" placeholder="Detalles opcionales..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <button className="primary-btn" onClick={submit} disabled={saving || !form.title.trim() || !form.date || !form.time}>
            {saving ? 'Guardando...' : 'Proponer quedada'}
          </button>
        </div>
      )}

      {quedadas.length === 0 && !showForm && (
        <div style={{ padding:'16px 0', textAlign:'center', color:'var(--gray-400)', fontSize:13 }}>
          No hay quedadas planeadas. ¡Propón una!
        </div>
      )}

      {quedadas.map(q => {
        const attending = q.quedada_asistentes?.some(a => a.user_id === userId)
        const attendees = q.quedada_asistentes || []
        return (
          <div key={q.id} style={{ background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:12, marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--ink)' }}>{q.title}</div>
                <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:3 }}>
                  🕐 {timeStr(q.scheduled_at)}
                  {q.bares && <span> · 📍 {q.bares.name}</span>}
                </div>
                {q.description && <div style={{ fontSize:12, color:'var(--gray-600)', marginTop:4 }}>{q.description}</div>}
              </div>
              {q.user_id === userId && (
                <button onClick={() => onDeleteQuedada(q.id)} style={{ background:'none', border:'none', color:'var(--gray-400)', cursor:'pointer', fontSize:14 }}>✕</button>
              )}
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10 }}>
              {/* Avatars */}
              <div style={{ display:'flex', gap:-4 }}>
                {attendees.slice(0,5).map((a, i) => (
                  <div key={a.user_id} style={{ width:24, height:24, borderRadius:'50%', background:'var(--red)', border:'2px solid var(--paper)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, color:'white', fontFamily:'var(--font-display)', marginLeft: i>0 ? -6 : 0, overflow:'hidden' }}>
                    {a.profiles?.avatar_url ? <img src={a.profiles.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials(a.profiles?.display_name)}
                  </div>
                ))}
                {attendees.length > 5 && <div style={{ width:24, height:24, borderRadius:'50%', background:'var(--gray-200)', border:'2px solid var(--paper)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'var(--gray-600)', marginLeft:-6 }}>+{attendees.length-5}</div>}
              </div>
              <span style={{ fontSize:11, color:'var(--gray-400)' }}>{attendees.length} apuntado{attendees.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => onToggleAsistencia(q.id, attending)}
                style={{ marginLeft:'auto', padding:'5px 12px', border:'none', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', background: attending ? 'var(--green-light)' : 'var(--red)', color: attending ? 'var(--green)' : 'white', fontFamily:'var(--font-display)' }}
              >
                {attending ? '✓ Apuntado' : 'Apuntarme'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
