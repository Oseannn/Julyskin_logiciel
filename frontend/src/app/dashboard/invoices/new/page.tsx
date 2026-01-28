'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function NewInvoicePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes, servicesRes] = await Promise.all([
        api.get('/clients'),
        api.get('/products'),
        api.get('/services'),
      ])
      setClients(clientsRes.data)
      setProducts(productsRes.data)
      setServices(servicesRes.data)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    }
  }

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setItems([...items, {
      type: 'product',
      id: product.id,
      name: product.name,
      price: product.sellingPrice,
      quantity: 1,
    }])
  }

  const addService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    setItems([...items, {
      type: 'service',
      id: service.id,
      name: service.name,
      billingType: service.billingType,
      unitPrice: service.unitPrice,
      minDuration: service.minDuration,
      duration: service.minDuration || 60, // Default duration
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...items]
    newItems[index].quantity = quantity
    setItems(newItems)
  }

  const updateDuration = (index: number, duration: number) => {
    const newItems = [...items]
    newItems[index].duration = duration
    setItems(newItems)
  }

  const calculateItemTotal = (item: any) => {
    if (item.type === 'product') {
      return Number(item.price) * item.quantity
    } else {
      // Service
      switch (item.billingType) {
        case 'PAR_MINUTE':
          return Number(item.unitPrice) * item.duration
        case 'PAR_HEURE':
          return Number(item.unitPrice) * (item.duration / 60)
        case 'FORFAIT':
          return Number(item.unitPrice)
        default:
          return 0
      }
    }
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    const tax = subtotal * 0.20
    return { subtotal, tax, total: subtotal + tax }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient || items.length === 0) {
      alert('Veuillez sélectionner un client et ajouter des articles')
      return
    }

    setLoading(true)
    try {
      const invoiceData = {
        clientId: selectedClient,
        items: items.map(item => {
          if (item.type === 'product') {
            return {
              productId: item.id,
              quantity: item.quantity,
            }
          } else {
            return {
              serviceId: item.id,
              duration: item.billingType !== 'FORFAIT' ? item.duration : undefined,
            }
          }
        }),
      }
      
      const response = await api.post('/invoices', invoiceData)
      router.push(`/dashboard/invoices/${response.data.id}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur création facture')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const { subtotal, tax, total } = calculateTotal()

  return (
    <Layout>
      <div className="px-4 sm:px-0 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle Facture</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Client</h3>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="input"
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Articles</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ajouter un produit</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addProduct(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="input"
                >
                  <option value="">Choisir...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {Number(product.sellingPrice).toFixed(2)} €
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ajouter un service</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addService(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="input"
                >
                  <option value="">Choisir...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {Number(service.unitPrice).toFixed(2)} €
                      {service.billingType === 'PAR_MINUTE' && '/min'}
                      {service.billingType === 'PAR_HEURE' && '/h'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Article</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Qté/Durée</th>
                      <th className="text-right py-2">Prix</th>
                      <th className="text-right py-2">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">
                          {item.type === 'product' ? (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Produit</span>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.billingType === 'PAR_MINUTE' ? 'bg-blue-100 text-blue-800' :
                              item.billingType === 'PAR_HEURE' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {item.billingType === 'PAR_MINUTE' ? 'Par min' :
                               item.billingType === 'PAR_HEURE' ? 'Par h' : 'Forfait'}
                            </span>
                          )}
                        </td>
                        <td className="py-2">
                          {item.type === 'product' ? (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                              className="input w-20"
                            />
                          ) : item.billingType !== 'FORFAIT' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={item.minDuration || 1}
                                value={item.duration}
                                onChange={(e) => updateDuration(index, parseInt(e.target.value))}
                                className="input w-20"
                              />
                              <span className="text-sm text-gray-500">min</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-2 text-right text-sm">
                          {item.type === 'product' ? (
                            `${Number(item.price).toFixed(2)} €`
                          ) : (
                            <>
                              {Number(item.unitPrice).toFixed(2)} €
                              {item.billingType === 'PAR_MINUTE' && '/min'}
                              {item.billingType === 'PAR_HEURE' && '/h'}
                            </>
                          )}
                        </td>
                        <td className="py-2 text-right font-semibold">
                          {calculateItemTotal(item).toFixed(2)} €
                        </td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (20%):</span>
                <span>{tax.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Création...' : 'Créer la facture'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn bg-gray-200 text-gray-700"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
