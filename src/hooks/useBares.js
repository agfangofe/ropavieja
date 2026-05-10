import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBares(userId) {
  const [bares, setBares] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBares = useCallback(async () => {
    const { data, error } = await supabase
      .from('bares')
      .select(`
        *,
        resenas(
          id, score, tapa_score, review_text, nota_personal, user_id, created_at,
          profiles!resenas_user_id_fkey(display_name, avatar_url),
          comentarios(
            id, text, created_at,
            profiles!comentarios_user_id_fkey(display_name, avatar_url)
          )
        ),
        favoritos(user_id),
        checkins(user_id, created_at, profiles!checkins_user_id_fkey(display_name))
      `)
      .order('created_at', { ascending: false })

    if (error) { console.error(error); return }

    const enriched = data.map(bar => {
      const scores = bar.resenas.map(r => r.score).filter(Boolean)
      const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null
      const isFav = bar.favoritos.some(f => f.user_id === userId)
      const userVisited = bar.checkins.some(c => c.user_id === userId)
      const favCount = bar.favoritos.length
      const isGhost = bar.last_activity_at
        ? (Date.now() - new Date(bar.last_activity_at).getTime()) > 30 * 24 * 60 * 60 * 1000
        : false

      return { ...bar, avgScore, isFav, userVisited, favCount, isGhost, reviewCount: scores.length }
    })

    // Crown = most favorited
    const maxFavs = Math.max(...enriched.map(b => b.favCount), 0)
    const crowned = enriched.map(b => ({ ...b, isCrown: b.favCount === maxFavs && maxFavs > 0 }))
    setBares(crowned)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchBares()

    // Realtime subscription
    const channel = supabase
      .channel('bares-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bares' }, fetchBares)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resenas' }, fetchBares)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favoritos' }, fetchBares)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, fetchBares)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchBares])

  async function addBar(data) {
    const { error } = await supabase.from('bares').insert({
      name: data.name,
      barrio: data.barrio,
      precio_cana: data.precio,
      image_url: data.image_url || null,
      lat: data.lat || null,
      lng: data.lng || null,
      added_by: userId,
      last_activity_at: new Date().toISOString(),
    })
    if (error) throw error

    // Auto-add first reseña
    if (data.nota || data.tapa_score) {
      const { data: inserted } = await supabase.from('bares').select('id').eq('name', data.name).eq('added_by', userId).order('created_at', { ascending: false }).limit(1).single()
      if (inserted) {
        await supabase.from('resenas').insert({
          bar_id: inserted.id,
          user_id: userId,
          score: parseFloat(data.nota) || null,
          tapa_score: data.tapa_score || null,
          review_text: data.review || null,
        })
      }
    }
    await fetchBares()
  }

  async function toggleFav(barId, currentlyFav) {
    if (currentlyFav) {
      await supabase.from('favoritos').delete().eq('bar_id', barId).eq('user_id', userId)
    } else {
      await supabase.from('favoritos').insert({ bar_id: barId, user_id: userId })
    }
    await fetchBares()
  }

  async function addCheckin(barId) {
    await supabase.from('checkins').upsert({ bar_id: barId, user_id: userId, created_at: new Date().toISOString() }, { onConflict: 'bar_id,user_id' })
    await fetchBares()
  }

  async function uploadImage(file) {
    const ext = file.name.split('.').pop()
    const path = `bars/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('bar-images').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('bar-images').getPublicUrl(path)
    return data.publicUrl
  }

  return { bares, loading, addBar, toggleFav, addCheckin, uploadImage, refetch: fetchBares }
}
