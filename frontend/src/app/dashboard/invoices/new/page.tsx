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
    setItems([...items, { type: 'PRODUCT', productId, quantity: 1, name: (product as any).name }]);
  };

  const addService = (serviceId: string) => {
    const service = services.find((s: any) => s.id === serviceId);
    if (!service) return;
    setItems([...items, { type: 'SERVICE', serviceId, duration: 60, name: (service as any).name }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
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

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Nouvelle facture</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">Sélectionner un client</option>
            {clients.map((client: any) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ajouter un produit</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addProduct(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Sélectionner un produit</option>
            {products.map((product: any) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.sellingPrice} €
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ajouter un service</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addService(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Sélectionner un service</option>
            {services.map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.billingType}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Articles</h3>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <span className="flex-1">{item.name}</span>
              {item.type === 'PRODUCT' && (
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                  min="1"
                />
              )}
              {item.type === 'SERVICE' && (
                <input
                  type="number"
                  value={item.duration}
                  onChange={(e) => updateItem(index, 'duration', parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                  placeholder="min"
                  min="1"
                />
              )}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !clientId || items.length === 0}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer la facture'}
        </button>
      </form>
    </Layout>
  );
}
