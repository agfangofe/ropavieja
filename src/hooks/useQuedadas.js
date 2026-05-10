import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useQuedadas(userId) {
  const [quedadas, setQuedadas] = useState([])

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('quedadas')
      .select(`*, profiles!quedadas_user_id_fkey(display_name, avatar_url), bares(name), quedada_asistentes(user_id, profiles!quedada_asistentes_user_id_fkey(display_name, avatar_url))`)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
    if (data) setQuedadas(data)
  }, [])

  useEffect(() => {
    fetch()
    const ch = supabase.channel('quedadas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quedadas' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quedada_asistentes' }, fetch)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetch])

  async function createQuedada({ title, description, bar_id, scheduled_at }) {
    const { data } = await supabase.from('quedadas').insert({ user_id: userId, title, description, bar_id, scheduled_at }).select().single()
    if (data) await supabase.from('quedada_asistentes').insert({ quedada_id: data.id, user_id: userId })
    fetch()
  }

  async function toggleAsistencia(quedadaId, attending) {
    if (attending) await supabase.from('quedada_asistentes').delete().eq('quedada_id', quedadaId).eq('user_id', userId)
    else await supabase.from('quedada_asistentes').insert({ quedada_id: quedadaId, user_id: userId })
    fetch()
  }

  async function deleteQuedada(quedadaId) {
    await supabase.from('quedadas').delete().eq('id', quedadaId)
    fetch()
  }

  return { quedadas, createQuedada, toggleAsistencia, deleteQuedada, refetch: fetch }
}
