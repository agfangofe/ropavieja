import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFeed(userId) {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFeed = useCallback(async () => {
    const { data, error } = await supabase
      .from('resenas')
      .select(`
        *,
        bares(name, barrio),
        profiles!resenas_user_id_fkey(display_name, avatar_url),
        likes(user_id),
        comentarios(
          id, text, created_at,
          profiles!comentarios_user_id_fkey(display_name, avatar_url),
          reacciones(emoji, user_id)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) { console.error(error); return }

    const enriched = data.map(post => {
      const userLiked = post.likes.some(l => l.user_id === userId)
      return { ...post, userLiked, likeCount: post.likes.length }
    })

    // Detect "opinión caliente": same bar, score diff > 3
    const byBar = {}
    enriched.forEach(p => {
      if (!p.score) return
      if (!byBar[p.bar_id]) byBar[p.bar_id] = []
      byBar[p.bar_id].push(p.score)
    })
    const hotBars = new Set(
      Object.entries(byBar)
        .filter(([, scores]) => Math.max(...scores) - Math.min(...scores) >= 3)
        .map(([id]) => id)
    )

    setFeed(enriched.map(p => ({ ...p, isHot: hotBars.has(p.bar_id) })))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchFeed()

    const channel = supabase
      .channel('feed-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resenas' }, fetchFeed)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comentarios' }, fetchFeed)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, fetchFeed)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reacciones' }, fetchFeed)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchFeed])

  async function toggleLike(resenaId, currentlyLiked) {
    if (currentlyLiked) {
      await supabase.from('likes').delete().eq('resena_id', resenaId).eq('user_id', userId)
    } else {
      await supabase.from('likes').insert({ resena_id: resenaId, user_id: userId })
    }
    await fetchFeed()
  }

  async function postComment(resenaId, text) {
    if (!text.trim()) return
    await supabase.from('comentarios').insert({ resena_id: resenaId, user_id: userId, text: text.trim() })
    await fetchFeed()
  }

  async function toggleReaccion(comentarioId, emoji) {
    const existing = await supabase
      .from('reacciones')
      .select('id')
      .eq('comentario_id', comentarioId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single()

    if (existing.data) {
      await supabase.from('reacciones').delete().eq('id', existing.data.id)
    } else {
      await supabase.from('reacciones').insert({ comentario_id: comentarioId, user_id: userId, emoji })
    }
    await fetchFeed()
  }

  async function addEmojiComment(resenaId, emoji) {
    await supabase.from('comentarios').insert({ resena_id: resenaId, user_id: userId, text: emoji })
    await fetchFeed()
  }

  return { feed, loading, toggleLike, postComment, toggleReaccion, addEmojiComment, refetch: fetchFeed }
}
