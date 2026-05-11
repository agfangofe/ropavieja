import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useNotificaciones(userId) {
  const [notifs, setNotifs] = useState([])
  const [unread, setUnread] = useState(0)

  const fetch = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('notificaciones')
      .select(`
        *,
        from_user:profiles!notificaciones_from_user_id_fkey(display_name, avatar_url),
        bares(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) {
      setNotifs(data)
      setUnread(data.filter(n => !n.read).length)
    }
  }, [userId])

  useEffect(() => {
    fetch()
    if (!userId) return
    const channel = supabase
      .channel(`notifs-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
      }, (payload) => {
        // Only refetch if this notification is for us
        if (payload.new?.user_id === userId) fetch()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetch, userId])

  async function markAllRead() {
    await supabase.from('notificaciones').update({ read: true }).eq('user_id', userId).eq('read', false)
    fetch()
  }

  async function createNotif(toUserId, type, extra = {}) {
    if (toUserId === userId) return // no te notifiques a ti mismo
    await supabase.from('notificaciones').insert({
      user_id: toUserId,
      from_user_id: userId,
      type,
      ...extra,
    })
  }

  return { notifs, unread, markAllRead, createNotif, refetch: fetch }
}
