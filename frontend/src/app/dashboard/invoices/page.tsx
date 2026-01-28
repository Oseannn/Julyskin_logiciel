'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function InvoicesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchInvoices()
  }, [user, router])

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices')
      setInvoices(response.data)
    } catch (error) {
      console.error('Erreur chargement factures:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      VALIDATED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    const labels = {
      DRAFT: 'Brouillon',
      VALIDATED: 'Validée',
      CANCELLED: 'Annulée',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (!user) return null

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Factures</h2>
          <button
            onClick={() => router.push('/dashboard/invoices/new')}
            className="btn btn-primary"
          >
            + Nouvelle Facture
          </button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.client.firstName} {invoice.client.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {invoice.lines?.slice(0, 2).map((line: any, idx: number) => (
                          <div key={idx} className="text-gray-600">
                            {line.name}
                            {line.duration && ` (${line.duration} min)`}
                          </div>
                        ))}
                        {invoice.lines?.length > 2 && (
                          <div className="text-gray-400 text-xs">
                            +{invoice.lines.length - 2} autre(s)
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {Number(invoice.total).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
