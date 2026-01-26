'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function StatsPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (!isAdmin()) {
      router.push('/dashboard')
      return
    }
    fetchStats()
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

  if (!user || !isAdmin()) return null

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistiques</h2>

        {loading ? (
          <p>Chargement...</p>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {stats.topProducts && stats.topProducts.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Produits les plus vendus</h3>
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Produit</th>
                      <th className="text-right py-2">Quantité</th>
                      <th className="text-right py-2">CA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((product: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{product.name}</td>
                        <td className="py-2 text-right">{product.quantity}</td>
                        <td className="py-2 text-right">{Number(product.revenue).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {stats.topServices && stats.topServices.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Services les plus demandés</h3>
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Service</th>
                      <th className="text-right py-2">Quantité</th>
                      <th className="text-right py-2">CA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topServices.map((service: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{service.name}</td>
                        <td className="py-2 text-right">{service.quantity}</td>
                        <td className="py-2 text-right">{Number(service.revenue).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {stats.salesByUser && stats.salesByUser.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Performance par vendeuse</h3>
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Vendeuse</th>
                      <th className="text-right py-2">Factures</th>
                      <th className="text-right py-2">CA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.salesByUser.map((user: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{user.userName}</td>
                        <td className="py-2 text-right">{user.invoiceCount}</td>
                        <td className="py-2 text-right">{Number(user.revenue).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <p>Aucune donnée disponible</p>
        )}
      </div>
    </Layout>
  )
}
