'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/clients'),
      api.get('/products'),
      api.get('/services'),
    ]).then(([c, p, s]) => {
      setClients(c.data);
      setProducts(p.data);
      setServices(s.data);
    });
  }, []);

  const addProduct = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;
    setItems([...items, {
      type: 'PRODUCT',
      productId,
      quantity: 1,
      name: (product as any).name,
      unitPrice: (product as any).sellingPrice,
    }]);
  };

  const addService = (serviceId: string) => {
    const service = services.find((s: any) => s.id === serviceId);
    if (!service) return;
    setItems([...items, {
      type: 'SERVICE',
      serviceId,
      duration: (service as any).minDuration || 60,
      name: (service as any).name,
      billingType: (service as any).billingType,
      unitPrice: (service as any).unitPrice,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      if (item.type === 'PRODUCT') {
        return sum + (item.quantity * item.unitPrice);
      } else {
        if (item.billingType === 'PAR_MINUTE') {
          return sum + (item.duration * item.unitPrice);
        } else if (item.billingType === 'PAR_HEURE') {
          return sum + ((item.duration / 60) * item.unitPrice);
        } else {
          return sum + item.unitPrice;
        }
      }
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.length === 0) return;

    setLoading(true);
    try {
      await api.post('/invoices', { clientId, items });
      router.push('/dashboard/invoices');
    } catch (error) {
      alert('Erreur lors de la création de la facture');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateTotal();
  const taxRate = 20;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Nouvelle facture</h2>
          <p className="text-sm text-gray-600 mt-1">Créer une facture pour un client</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Client</h3>
            <div>
              <label htmlFor="client" className="label">
                Sélectionner un client
              </label>
              <select
                id="client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input"
                required
              >
                <option value="">Choisir un client</option>
                {clients.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Articles</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="product" className="label">
                  Ajouter un produit
                </label>
                <select
                  id="product"
                  onChange={(e) => {
                    if (e.target.value) {
                      addProduct(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="input"
                >
                  <option value="">Choisir un produit</option>
                  {products.map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {Number(product.sellingPrice).toFixed(2)} €
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="service" className="label">
                  Ajouter un service
                </label>
                <select
                  id="service"
                  onChange={(e) => {
                    if (e.target.value) {
                      addService(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="input"
                >
                  <option value="">Choisir un service</option>
                  {services.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {items.length > 0 && (
              <div className="border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Article
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Qté / Durée
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Prix unit.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => {
                      let itemTotal = 0;
                      if (item.type === 'PRODUCT') {
                        itemTotal = item.quantity * item.unitPrice;
                      } else {
                        if (item.billingType === 'PAR_MINUTE') {
                          itemTotal = item.duration * item.unitPrice;
                        } else if (item.billingType === 'PAR_HEURE') {
                          itemTotal = (item.duration / 60) * item.unitPrice;
                        } else {
                          itemTotal = item.unitPrice;
                        }
                      }

                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{item.name}</td>
                          <td className="px-4 py-3">
                            {item.type === 'PRODUCT' ? (
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                className="input w-20 text-sm"
                                min="1"
                              />
                            ) : (
                              <input
                                type="number"
                                value={item.duration}
                                onChange={(e) => updateItem(index, 'duration', parseInt(e.target.value))}
                                className="input w-20 text-sm"
                                min="1"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {Number(item.unitPrice).toFixed(2)} €
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {itemTotal.toFixed(2)} €
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {items.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8 border border-gray-200">
                Aucun article ajouté
              </p>
            )}
          </div>

          {/* Totaux */}
          {items.length > 0 && (
            <div className="card p-6">
              <div className="max-w-sm ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total HT</span>
                  <span className="font-medium">{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA ({taxRate}%)</span>
                  <span className="font-medium">{taxAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span>Total TTC</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !clientId || items.length === 0}
              className="btn-primary"
            >
              {loading ? 'Création...' : 'Créer la facture'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
