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

  const addItem = (type: 'product' | 'service', id: string) => {
    const item = type === 'product' 
      ? products.find(p => p.id === id)
      : services.find(s => s.id === id)
    
    if (!item) return

    setItems([...items, {
      type,
      id: item.id,
      name: item.name,
      price: type === 'product' ? item.sellingPrice : item.price,
      quantity: 1,
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

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
    const tax = subtotal * 0.20
    return { subtotal, tax, total: subtotal + tax }
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
        items: items.map(item => ({
          productId: item.type === 'product' ? item.id : undefined,
          serviceId: item.type === 'service' ? item.id : undefined,
          quantity: item.quantity,
        })),
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
                      addItem('product', e.target.value)
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
                      addItem('service', e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="input"
                >
                  <option value="">Choisir...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {Number(service.price).toFixed(2)} €
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {items.length > 0 && (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Article</th>
                    <th className="text-left py-2">Prix</th>
                    <th className="text-left py-2">Qté</th>
                    <th className="text-right py-2">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">{Number(item.price).toFixed(2)} €</td>
                      <td className="py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                          className="input w-20"
                        />
                      </td>
                      <td className="py-2 text-right">
                        {(Number(item.price) * item.quantity).toFixed(2)} €
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
