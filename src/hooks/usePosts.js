import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePosts(userId) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select(`*, profiles!posts_user_id_fkey(display_name, avatar_url), post_likes(user_id), post_comentarios(id, text, created_at, profiles!post_comentarios_user_id_fkey(display_name, avatar_url))`)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) {
      setPosts(data.map(p => ({ ...p, userLiked: p.post_likes.some(l => l.user_id === userId), likeCount: p.post_likes.length })))
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetch()
    const ch = supabase.channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comentarios' }, fetch)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetch])

  async function createPost({ text, image_url }) {
    await supabase.from('posts').insert({ user_id: userId, text, image_url })
    fetch()
  }

  async function deletePost(postId) {
    await supabase.from('posts').delete().eq('id', postId)
    fetch()
  }

  async function toggleLike(postId, liked) {
    if (liked) await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
    else await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
    fetch()
  }

  async function addComment(postId, text) {
    if (!text.trim()) return
    await supabase.from('post_comentarios').insert({ post_id: postId, user_id: userId, text: text.trim() })
    fetch()
  }

  async function deleteComment(commentId) {
    await supabase.from('post_comentarios').delete().eq('id', commentId)
    fetch()
  }

  async function uploadImage(file, uploadFn) {
    return uploadFn(file)
  }

  return { posts, loading, createPost, deletePost, toggleLike, addComment, deleteComment, refetch: fetch }
}
