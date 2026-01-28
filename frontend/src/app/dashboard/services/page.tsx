'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function ServicesPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuthStore()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchServices()
  }, [user, router])

  const fetchServices = async () => {
    try {
      const response = await api.get('/services')
      setServices(response.data)
    } catch (error) {
      console.error('Erreur chargement services:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          {isAdmin() && (
            <button
              onClick={() => router.push('/dashboard/services/new')}
              className="btn btn-primary"
            >
              + Nouveau Service
            </button>
          )}
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    service.billingType === 'PAR_MINUTE' ? 'bg-blue-100 text-blue-800' :
                    service.billingType === 'PAR_HEURE' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {service.billingType === 'PAR_MINUTE' ? 'Par minute' :
                     service.billingType === 'PAR_HEURE' ? 'Par heure' : 'Forfait'}
                  </span>
                </div>
                <p className="text-gray-600 mt-2 text-sm">{service.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {Number(service.unitPrice).toFixed(2)} €
                    {service.billingType === 'PAR_MINUTE' && <span className="text-sm text-gray-500">/min</span>}
                    {service.billingType === 'PAR_HEURE' && <span className="text-sm text-gray-500">/h</span>}
                  </span>
                  {service.minDuration && (
                    <span className="text-sm text-gray-500">Min: {service.minDuration} min</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
