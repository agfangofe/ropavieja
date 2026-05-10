import { computeStats } from '../lib/badges'

function initials(name) {
  return name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?'
}

export default function EstadisticasPanel({ bares, feed, userId }) {
  const stats = computeStats(bares, feed)

  return (
    <div style={{ padding:'0 12px 12px' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:11, fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:1, marginBottom:10, marginTop:14 }}>
        📊 Estadísticas del grupo
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
        <div style={{ background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:12 }}>
          <div style={{ fontSize:10, color:'var(--gray-400)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Total bares</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--ink)' }}>{stats.totalBares}</div>
        </div>
        <div style={{ background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:12 }}>
          <div style={{ fontSize:10, color:'var(--gray-400)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Total reseñas</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--ink)' }}>{stats.totalResenas}</div>
        </div>
      </div>

      {stats.avgCana && (
        <div style={{ background:'var(--amber-light)', border:'1px solid var(--amber)', borderRadius:'var(--radius)', padding:12, marginBottom:8 }}>
          <div style={{ fontSize:10, color:'var(--amber)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5, fontWeight:700 }}>🍺 Precio medio de caña en el barrio</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:'var(--amber)' }}>{stats.avgCana}€</div>
        </div>
      )}

      {stats.topBar && (
        <div style={{ background:'var(--paper)', border:'1.5px solid var(--amber)', borderRadius:'var(--radius)', padding:12, marginBottom:8 }}>
          <div style={{ fontSize:10, color:'var(--amber)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5, fontWeight:700 }}>👑 Bar más valorado</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:800, color:'var(--ink)' }}>{stats.topBar.name}</div>
          <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:2 }}>★ {stats.topBar.avgScore?.toFixed(1) || '—'} · {stats.topBar.reviewCount} opiniones</div>
        </div>
      )}

      {stats.cheapestBar && (
        <div style={{ background:'var(--green-light)', border:'1px solid var(--green)', borderRadius:'var(--radius)', padding:12, marginBottom:8 }}>
          <div style={{ fontSize:10, color:'var(--green)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5, fontWeight:700 }}>💸 Caña más barata</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:800, color:'var(--ink)' }}>{stats.cheapestBar.name}</div>
          <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:2 }}>🍺 {stats.cheapestBar.precio_cana}</div>
        </div>
      )}

      {stats.mostActive && stats.mostActive[1].profile && (
        <div style={{ background:'var(--purple-light)', border:'1px solid var(--purple)', borderRadius:'var(--radius)', padding:12 }}>
          <div style={{ fontSize:10, color:'var(--purple)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5, fontWeight:700 }}>🏆 Miembro más activo</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'white', fontFamily:'var(--font-display)', overflow:'hidden' }}>
              {stats.mostActive[1].profile?.avatar_url ? <img src={stats.mostActive[1].profile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials(stats.mostActive[1].profile?.display_name)}
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--ink)' }}>{stats.mostActive[1].profile?.display_name}</div>
              <div style={{ fontSize:11, color:'var(--gray-400)' }}>{stats.mostActive[1].resenas} reseñas · {stats.mostActive[1].bares || 0} bares añadidos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
