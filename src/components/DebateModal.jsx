export default function DebateModal({ post, onClose }) {
  if (!post) return null

  // Find the two most extreme scores for this bar from comments context
  const barName = post.bares?.name || 'este bar'

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title" style={{ color: 'var(--red-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚖️ Debate abierto
        </div>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16 }}>
          {barName} · hay opiniones muy distintas en el grupo
        </p>

        <div className="debate-scores">
          <div className="d-score-card">
            <div className="d-score-who">{post.profiles?.display_name || 'Alguien'}</div>
            <div className="d-score-num">{post.score ?? '?'}</div>
            <div style={{ fontSize: 10, color: 'var(--red)' }}>Esta es mi nota</div>
          </div>
          <div className="d-vs">VS</div>
          <div className="d-score-card">
            <div className="d-score-who">Otro del grupo</div>
            <div className="d-score-num">?</div>
            <div style={{ fontSize: 10, color: 'var(--red)' }}>Nota diferente</div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8, lineHeight: 1.6 }}>
          Cuando hay más de 3 puntos de diferencia entre reseñas del mismo bar, se activa el modo debate.
          Discutid en los comentarios hasta llegar a un consenso... o no.
        </p>

        <button className="primary-btn" style={{ marginTop: 20 }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}
