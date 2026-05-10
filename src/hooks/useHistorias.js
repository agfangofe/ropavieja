import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useHistorias(userId) {
  const [historias, setHistorias] = useState([])

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('historias')
      .select(`*, profiles!historias_user_id_fkey(display_name, avatar_url), bares(name)`)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    if (data) setHistorias(data)
  }, [])

  useEffect(() => {
    fetch()
    const channel = supabase
      .channel('historias-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historias' }, fetch)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetch])

  async function addHistoria({ bar_id, image_url, caption }) {
    await supabase.from('historias').insert({ user_id: userId, bar_id, image_url, caption })
    fetch()
  }

  async function uploadAndAddHistoria(file, bar_id, caption, uploadFn) {
    const url = await uploadFn(file)
    await addHistoria({ bar_id, image_url: url, caption })
  }

  return { historias, addHistoria, uploadAndAddHistoria, refetch: fetch }
}
