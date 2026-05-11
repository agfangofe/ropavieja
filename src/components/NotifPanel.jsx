const ICONS = { new_bar:'🍺', new_opinion:'⭐', mention:'💬', like:'❤️' }
const TEXTS = {
  new_bar: (n) => `${n.from_user?.display_name} añadió ${n.bares?.name}`,
  new_opinion: (n) => `${n.from_user?.display_name} opinó sobre ${n.bares?.name}`,
  mention: (n) => `${n.from_user?.display_name} te mencionó en ${n.bares?.name}`,
  like: (n) => `${n.from_user?.display_name} le dio like a tu reseña`,
}

function timeAgo(d) {
  const s = (Date.now() - new Date(d).getTime()) / 1000
  if (s < 60) return 'ahora'
  if (s < 3600) return `hace ${Math.floor(s/60)}min`
  if (s < 86400) return `hace ${Math.floor(s/3600)}h`
  return `hace ${Math.floor(s/86400)}d`
}

export default function NotifPanel({ notifs, onClose, onMarkRead, onBarClick, bares }) {
  function handleClick(n) {
    if (n.bar_id && onBarClick && bares) {
      const bar = bares.find(b => b.id === n.bar_id)
      if (bar) {
        onMarkRead()
        onBarClick(bar)
        return
      }
    }
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex', flexDirection:'column', justifyContent:'flex-start' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(26,25,22,0.4)' }} onClick={onClose} />
      <div style={{ position:'relative', background:'var(--paper)', maxWidth:480, width:'100%', margin:'56px auto 0', borderRadius:'0 0 16px 16px', maxHeight:'70vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--ink)' }}>Notificaciones</span>
          <button onClick={onMarkRead} style={{ fontSize:11, color:'var(--gray-400)', background:'none', border:'none', cursor:'pointer' }}>Marcar todas leídas</button>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {notifs.length === 0 && (
            <div style={{ padding:32, textAlign:'center', color:'var(--gray-400)', fontSize:13 }}>Sin notificaciones</div>
          )}
          {notifs.map(n => (
            <div key={n.id} onClick={() => handleClick(n)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid var(--border)', background: n.read ? 'transparent' : 'var(--amber-light)', cursor: n.bar_id ? 'pointer' : 'default' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                {ICONS[n.type] || '🔔'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, color:'var(--ink)', lineHeight:1.4 }}>{TEXTS[n.type]?.(n) || 'Nueva actividad'}</div>
                <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:2 }}>{timeAgo(n.created_at)}</div>
              </div>
              {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--red)', flexShrink:0 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
