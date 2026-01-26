'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuthStore()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (!isAdmin()) {
      router.push('/dashboard')
      return
    }
    fetchSettings()
  }, [user, router])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/settings', settings)
      alert('Paramètres mis à jour avec succès')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur mise à jour paramètres')
    } finally {
      setSaving(false)
    }
  }

  if (!user || !isAdmin()) return null

  return (
    <Layout>
      <div className="px-4 sm:px-0 max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h2>

        {loading ? (
          <p>Chargement...</p>
        ) : settings ? (
          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la boutique
              </label>
              <input
                type="text"
                value={settings.shopName || ''}
                onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={settings.shopAddress || ''}
                onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={settings.shopPhone || ''}
                onChange={(e) => setSettings({ ...settings, shopPhone: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.shopEmail || ''}
                onChange={(e) => setSettings({ ...settings, shopEmail: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de TVA par défaut (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.defaultTaxRate || 20}
                onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préfixe des factures
              </label>
              <input
                type="text"
                value={settings.invoicePrefix || 'JS'}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="input"
                maxLength={5}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        ) : (
          <p>Aucun paramètre trouvé</p>
        )}
      </div>
    </Layout>
  )
}
