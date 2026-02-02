'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Save } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function NewInvoicePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [taxRate, setTaxRate] = useState(20);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/clients'),
      api.get('/products'),
      api.get('/services'),
      api.get('/settings'),
    ]).then(([clientsRes, productsRes, servicesRes, settingsRes]) => {
      setClients(clientsRes.data);
      setProducts(productsRes.data);
      setServices(servicesRes.data);
      if (settingsRes.data.length > 0) {
        setTaxRate(settingsRes.data[0].defaultTaxRate);
      }
    });
  }, []);

  const addProduct = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;

    setItems([...items, {
      type: 'PRODUCT',
      productId: product.id,
      name: product.name,
      quantity: 1,
      unitPrice: product.sellingPrice,
    }]);
  };

  const addService = (serviceId: string) => {
    const service = services.find((s: any) => s.id === serviceId);
    if (!service) return;

    setItems([...items, {
      type: 'SERVICE',
      serviceId: service.id,
      name: service.name,
      duration: service.minDuration || 60,
      unitPrice: service.unitPrice,
      billingType: service.billingType,
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

  const calculateItemTotal = (item: any) => {
    if (item.type === 'PRODUCT') {
      return item.quantity * item.unitPrice;
    } else {
      if (item.billingType === 'PAR_MINUTE') {
        return Math.round((item.duration * item.unitPrice));
      } else if (item.billingType === 'PAR_HEURE') {
        return Math.round((item.duration / 60) * item.unitPrice);
      } else {
        return item.unitPrice;
      }
    }
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (items.length === 0) {
      alert('Veuillez ajouter au moins un article');
      return;
    }

    try {
      const invoiceData = {
        clientId: selectedClient,
        userId: user?.id,
        taxRate,
        notes,
        lines: items.map(item => ({
          type: item.type,
          productId: item.productId,
          serviceId: item.serviceId,
          name: item.name,
          quantity: item.quantity,
          duration: item.duration,
          unitPrice: item.unitPrice,
          total: calculateItemTotal(item),
        })),
      };

      await api.post('/invoices', invoiceData);
      router.push('/dashboard/invoices');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la création de la facture');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nouvelle facture</h2>
          <p className="text-muted-foreground mt-1">Créez une nouvelle facture pour un client</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
                <CardDescription>Sélectionnez le client pour cette facture</CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} - {client.phone}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Add Items */}
            <Card>
              <CardHeader>
                <CardTitle>Ajouter des articles</CardTitle>
                <CardDescription>Ajoutez des produits ou services à la facture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ajouter un produit</Label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addProduct(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map((product: any) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.sellingPrice} FCFA
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ajouter un service</Label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addService(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Sélectionner un service</option>
                      {services.map((service: any) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.unitPrice} FCFA
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Qté/Durée</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucun article ajouté
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, index) => {
                        const itemTotal = calculateItemTotal(item);
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <Badge variant="outline" className="mt-1">
                                  {item.type === 'PRODUCT' ? 'Produit' : 'Service'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.type === 'PRODUCT' ? (
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                  className="w-20"
                                />
                              ) : (
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.duration}
                                  onChange={(e) => updateItem(index, 'duration', parseInt(e.target.value))}
                                  className="w-20"
                                />
                              )}
                            </TableCell>
                            <TableCell>{item.unitPrice} FCFA</TableCell>
                            <TableCell className="font-medium">{itemTotal} FCFA</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span className="font-medium">{subtotal} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA ({taxRate}%)</span>
                  <span className="font-medium">{taxAmount} FCFA</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total TTC</span>
                    <span className="text-2xl font-bold text-primary">{total} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes additionnelles..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </CardContent>
            </Card>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              <Save className="mr-2 h-4 w-4" />
              Créer la facture
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
