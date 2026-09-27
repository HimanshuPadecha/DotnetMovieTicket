import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'
import { getErrorMessage } from '../api/client'
import { toast } from '../components/Toast'
import { Badge, Button, Input, PageHeader } from '../components/ui'

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toast('Name and email are required', 'error')
      return
    }
    setSaving(true)
    try {
      const updated = await authApi.updateProfile(name.trim(), email.trim())
      updateUser(updated)
      toast('Profile updated', 'success')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast('New password must be at least 6 characters', 'error')
      return
    }
    setPwdSaving(true)
    try {
      const res = await authApi.changePassword(currentPassword, newPassword)
      toast(res.message || 'Password updated', 'success')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setPwdSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-xl animate-fade-up space-y-8">
      <PageHeader
        title="Profile"
        subtitle="Manage your account details."
        actions={<Badge tone={user.role === 'ADMIN' ? 'gold' : 'neutral'}>{user.role}</Badge>}
      />

      <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-white/8 bg-cinema-900/60 p-6">
        <h2 className="font-semibold">Account</h2>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <form onSubmit={savePassword} className="space-y-4 rounded-2xl border border-white/8 bg-cinema-900/60 p-6">
        <h2 className="font-semibold">Change password</h2>
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button type="submit" variant="secondary" disabled={pwdSaving}>
          {pwdSaving ? 'Updating…' : 'Update password'}
        </Button>
      </form>

      <Button variant="danger" onClick={() => logout()}>
        Log out
      </Button>
    </div>
  )
}
