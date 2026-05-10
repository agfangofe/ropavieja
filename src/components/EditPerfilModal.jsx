import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function EditPerfilModal({ profile, onClose, onRefresh }) {
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    ciudad: profile?.ciudad || '',
  })
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
  const fileRef = useRef()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function save() {
    setSaving(true)
    try {
      let avatar_url = profile?.avatar_url

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${profile.id}.${ext}`
        await supabase.storage.from('bar-images').upload(path, avatarFile, { upsert: true })
        const { data } = supabase.storage.from('bar-images').getPublicUrl(path)
        avatar_url = data.publicUrl
      }

      await supabase.from('profiles').update({
        display_name: form.display_name,
        bio: form.bio,
        ciudad: form.ciudad,
        avatar_url,
      }).eq('id', profile.id)

      onRefresh()
      onClose()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Editar perfil</div>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--red)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'white' }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : form.display_name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
              }
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✏️</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
        </div>

        <div className="form-group">
          <label className="form-label">Nombre</label>
          <input className="form-input" placeholder="Tu nombre" value={form.display_name} onChange={e => set('display_name', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Ciudad</label>
          <input className="form-input" placeholder="Madrid, Barcelona..." value={form.ciudad} onChange={e => set('ciudad', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-input" rows={3} placeholder="Amante de las gildas y las cañas frías..." value={form.bio} onChange={e => set('bio', e.target.value)} />
        </div>

        <button className="primary-btn" onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar perfil'}
        </button>
        <button className="cancel-lnk" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
