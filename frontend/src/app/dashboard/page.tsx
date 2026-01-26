'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (isAdmin()) {
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [user, router])

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Bienvenue, {user.firstName} !
        </h2>

        {isAdmin() && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">Chiffre d'affaires</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {Number(stats.totalRevenue).toFixed(2)} €
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">Factures</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.invoiceCount}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/invoices/new')}>
            <h3 className="text-lg font-semibold text-gray-900">Nouvelle Facture</h3>
            <p className="text-gray-600 mt-2">Créer une nouvelle facture</p>
          </div>

          <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/products')}>
            <h3 className="text-lg font-semibold text-gray-900">Produits</h3>
            <p className="text-gray-600 mt-2">Gérer le catalogue produits</p>
          </div>

          <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/clients')}>
            <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
            <p className="text-gray-600 mt-2">Gérer les clients</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
