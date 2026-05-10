// Computes badges based on user activity
export function computeBadges(userId, bares, feed, posts) {
  const badges = []
  const myResenas = feed.filter(f => f.user_id === userId)
  const myBares = bares.filter(b => b.added_by === userId)
  const myAvg = myResenas.length ? myResenas.reduce((s, r) => s + (r.score || 0), 0) / myResenas.length : null

  if (myBares.length >= 1) badges.push({ id: 'first_bar', emoji: '🍺', label: 'Primer bar del barrio' })
  if (myBares.length >= 5) badges.push({ id: 'explorer', emoji: '🗺️', label: 'Explorador del barrio' })
  if (myBares.length >= 10) badges.push({ id: 'experto', emoji: '🏅', label: 'Experto del barrio' })
  if (myResenas.length >= 10) badges.push({ id: 'enterao', emoji: '🏆', label: 'El Enterao del Barrio' })
  if (myResenas.length >= 25) badges.push({ id: 'critico', emoji: '✍️', label: 'Crítico profesional' })
  if (myAvg !== null && myAvg < 6 && myResenas.length >= 3) badges.push({ id: 'exigente', emoji: '😤', label: 'Crítico exigente' })
  if (myAvg !== null && myAvg >= 9 && myResenas.length >= 3) badges.push({ id: 'optimista', emoji: '☀️', label: 'El optimista del grupo' })
  if (bares.filter(b => b.isGhost && (b.userVisited)).length > 0) badges.push({ id: 'cazafantasmas', emoji: '👻', label: 'Cazafantasmas' })
  if (bares.some(b => b.isCrown && b.added_by === userId)) badges.push({ id: 'predilecto', emoji: '👑', label: 'Dueño del predilecto' })
  if ((posts || []).filter(p => p.user_id === userId).length >= 5) badges.push({ id: 'social', emoji: '📸', label: 'Alma social del grupo' })

  return badges
}

export function computeStats(bares, feed, profiles) {
  const barStats = bares.map(b => ({
    ...b,
    resenaCount: b.resenas?.length || 0,
  }))

  const topBar = barStats.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))[0]
  const cheapestBar = [...bares].filter(b => b.precio_cana).sort((a, b) => parseFloat(a.precio_cana) - parseFloat(b.precio_cana))[0]

  const userActivity = {}
  feed.forEach(r => {
    if (!userActivity[r.user_id]) userActivity[r.user_id] = { resenas: 0, profile: r.profiles }
    userActivity[r.user_id].resenas++
  })
  bares.forEach(b => {
    if (!userActivity[b.added_by]) userActivity[b.added_by] = { resenas: 0, bares: 0 }
    userActivity[b.added_by].bares = (userActivity[b.added_by].bares || 0) + 1
  })

  const mostActive = Object.entries(userActivity).sort((a, b) => (b[1].resenas + (b[1].bares||0)) - (a[1].resenas + (a[1].bares||0)))[0]

  const avgCana = bares.filter(b => b.precio_cana).length
    ? (bares.filter(b => b.precio_cana).reduce((s, b) => s + parseFloat(b.precio_cana), 0) / bares.filter(b => b.precio_cana).length).toFixed(2)
    : null

  return { topBar, cheapestBar, mostActive, avgCana, totalBares: bares.length, totalResenas: feed.length }
}
