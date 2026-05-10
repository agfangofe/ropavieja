import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { MiniMapa } from './MapaReal'

export default function BarDetalleModal({ bar, userId, profile, onClose, onRefresh }) {
  const [tab, setTab] = useState('info') // info | opinion | comentarios
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: bar.name || '',
    barrio: bar.barrio || '',
    precio_cana: bar.precio_cana || '',
  })
  const [opinionForm, setOpinionForm] = useState({
    score: '',
    tapa_score: '',
    review_text: '',
    nota_personal: '',
  })
  const [saving, setSaving] = useState(false)
  const [savingOpinion, setSavingOpinion] = useState(false)
  const [comentario, setComentario] = useState('')
  const [stars, setStars] = useState(0)
  const [tapaStars, setTapaStars] = useState(0)

  // Find my existing reseña
  const myResena = bar.resenas?.find(r => r.user_id === userId)

  async function saveBarEdit() {
    setSaving(true)
    try {
      await supabase.from('bares').update({
        name: editForm.name,
        barrio: editForm.barrio,
        precio_cana: editForm.precio_cana,
      }).eq('id', bar.id)
      onRefresh()
      setEditing(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  async function saveOpinion() {
    if (!stars && !opinionForm.review_text) return
    setSavingOpinion(true)
    try {
      const data = {
        bar_id: bar.id,
        user_id: userId,
        score: stars || null,
        tapa_score: tapaStars * 2 || null,
        review_text: opinionForm.review_text || null,
        nota_personal: opinionForm.nota_personal || null,
      }
      if (myResena) {
        await supabase.from('resenas').update(data).eq('id', myResena.id)
      } else {
        await supabase.from('resenas').insert(data)
      }
      onRefresh()
      setTab('info')
    } catch (e) { console.error(e) }
    finally { setSavingOpinion(false) }
  }

  async function sendComentario() {
    if (!comentario.trim() || !myResena) return
    await supabase.from('comentarios').insert({
      resena_id: myResena.id,
      user_id: userId,
      text: comentario.trim(),
    })
    setComentario('')
    onRefresh()
  }

  const avgScore = bar.resenas?.length
    ? (bar.resenas.reduce((s, r) => s + (r.score || 0), 0) / bar.resenas.length).toFixed(1)
    : null

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet" style={{ maxHeight: '90vh' }}>
        <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            {editing ? (
              <input className="form-input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 6 }} />
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
                {bar.name} {bar.isCrown ? '👑' : ''} {bar.isGhost ? '👻' : ''}
              </div>
            )}
            {avgScore && <div style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 700, marginTop: 2 }}>★ {avgScore} · {bar.resenas?.length} opiniones</div>}
          </div>
          <button onClick={() => setEditing(p => !p)} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--gray-600)', fontWeight: 600 }}>
            {editing ? 'Cancelar' : '✏️ Editar'}
          </button>
        </div>

        {/* Edit fields */}
        {editing && (
          <div style={{ marginBottom: 14 }}>
            <div className="form-2col" style={{ marginBottom: 8 }}>
              <div>
                <label className="form-label">Barrio</label>
                <input className="form-input" value={editForm.barrio} onChange={e => setEditForm(p => ({ ...p, barrio: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Precio caña</label>
                <input className="form-input" value={editForm.precio_cana} onChange={e => setEditForm(p => ({ ...p, precio_cana: e.target.value }))} />
              </div>
            </div>
            <button className="primary-btn" onClick={saveBarEdit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 10, padding: 3, marginBottom: 14 }}>
          {[['info', 'ℹ️ Info'], ['opinion', '⭐ Mi opinión'], ['comentarios', '💬 Debate']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '7px 4px', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: tab === id ? 'var(--paper)' : 'none', color: tab === id ? 'var(--ink)' : 'var(--gray-600)', boxShadow: tab === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontFamily: 'var(--font-display)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* INFO TAB */}
        {tab === 'info' && (
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {bar.precio_cana && <span className="pill pill-beer">🍺 {bar.precio_cana}</span>}
              {bar.barrio && <span style={{ fontSize: 11, color: 'var(--gray-600)', padding: '3px 8px', background: 'var(--gray-100)', borderRadius: 20 }}>📍 {bar.barrio}</span>}
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Opiniones del grupo
            </div>

            {bar.resenas?.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--gray-400)', padding: '12px 0' }}>Sé el primero en dejar tu opinión</div>
            )}

            {bar.resenas?.map((r, i) => (
              <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>
                    {r.profiles?.display_name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?'}
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{r.profiles?.display_name || 'Alguien'}</span>
                  {r.score && <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>★ {r.score}</span>}
                </div>
                {r.review_text && <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 4 }}>{r.review_text}</div>}
                {r.nota_personal && r.user_id === userId && (
                  <div style={{ fontSize: 11, background: 'var(--amber-light)', color: 'var(--amber)', padding: '3px 8px', borderRadius: 8, display: 'inline-block', marginTop: 3 }}>
                    🔒 {r.nota_personal}
                  </div>
                )}
              </div>
            ))}

            <button onClick={() => setTab('opinion')} style={{ width: '100%', marginTop: 12, background: 'var(--red)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: 12, fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {myResena ? '✏️ Editar mi opinión' : '⭐ Añadir mi opinión'}
            </button>
          </div>
        )}

        {/* OPINION TAB */}
        {tab === 'opinion' && (
          <div>
            <div className="form-group">
              <label className="form-label">Tu nota (0–10)</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setStars(n)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-strong)', background: stars >= n ? 'var(--amber)' : 'var(--gray-50)', color: stars >= n ? 'white' : 'var(--gray-600)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Calidad de la tapa</label>
              <div className="star-row">
                {[1,2,3,4,5].map(n => (
                  <button key={n} className={`star-b${tapaStars >= n ? ' on' : ''}`} onClick={() => setTapaStars(n)}>★</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reseña pública</label>
              <textarea className="form-input" rows={3} placeholder="Las gildas son increíbles, la tortilla un poco seca..." value={opinionForm.review_text} onChange={e => setOpinionForm(p => ({ ...p, review_text: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Nota personal 🔒 (solo tú la ves)</label>
              <input className="form-input" placeholder="Las gildas son increíbles" value={opinionForm.nota_personal} onChange={e => setOpinionForm(p => ({ ...p, nota_personal: e.target.value }))} />
            </div>

            <button className="primary-btn" onClick={saveOpinion} disabled={savingOpinion}>
              {savingOpinion ? 'Guardando...' : myResena ? 'Actualizar opinión' : 'Publicar opinión'}
            </button>
            <button className="cancel-lnk" onClick={() => setTab('info')}>Cancelar</button>
          </div>
        )}

        {/* DEBATE TAB */}
        {tab === 'comentarios' && (
          <div>
            {!myResena && (
              <div style={{ fontSize: 12, color: 'var(--gray-400)', padding: '10px 0', marginBottom: 10 }}>
                Añade primero tu opinión para poder comentar
              </div>
            )}
            {bar.resenas?.map(r => (
              <div key={r.id} style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                  {r.profiles?.display_name} {r.score ? `· ★ ${r.score}` : ''}
                </div>
                {r.comentarios?.map(c => (
                  <div key={c.id} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '8px 10px', marginBottom: 5, fontSize: 13, color: 'var(--ink)' }}>
                    <span style={{ fontWeight: 600, fontSize: 11 }}>{c.profiles?.display_name}: </span>
                    {c.text}
                  </div>
                ))}
              </div>
            ))}

            {myResena && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input
                  className="form-input"
                  placeholder="Añade un comentario al debate..."
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendComentario()}
                  style={{ flex: 1 }}
                />
                <button onClick={sendComentario} className="send-btn" style={{ width: 36, height: 36, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
