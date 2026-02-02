'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState('');
  const [formData, setFormData] = useState({
    shopName: '',
    shopAddress: '',
    shopPhone: '',
    shopEmail: '',
    defaultTaxRate: '20',
    invoicePrefix: 'INV',
    nextInvoiceNumber: '1',
  });

  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data.length > 0) {
        const settings = res.data[0];
        setSettingsId(settings.id);
        setFormData({
          shopName: settings.shopName,
          shopAddress: settings.shopAddress || '',
          shopPhone: settings.shopPhone || '',
          shopEmail: settings.shopEmail || '',
          defaultTaxRate: settings.defaultTaxRate.toString(),
          invoicePrefix: settings.invoicePrefix,
          nextInvoiceNumber: settings.nextInvoiceNumber.toString(),
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        defaultTaxRate: parseInt(formData.defaultTaxRate),
        nextInvoiceNumber: parseInt(formData.nextInvoiceNumber),
      };

      if (settingsId) {
        await api.put(`/settings/${settingsId}`, data);
      } else {
        const res = await api.post('/settings', data);
        setSettingsId(res.data.id);
      }

      alert('Paramètres enregistrés avec succès');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
          <p className="text-muted-foreground mt-1">Gérez les paramètres de votre boutique</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la boutique</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos factures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="shopName">Nom de la boutique</Label>
                  <Input
                    id="shopName"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shopPhone">Téléphone</Label>
                  <Input
                    id="shopPhone"
                    type="tel"
                    value={formData.shopPhone}
                    onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shopAddress">Adresse</Label>
                <Input
                  id="shopAddress"
                  value={formData.shopAddress}
                  onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shopEmail">Email</Label>
                <Input
                  id="shopEmail"
                  type="email"
                  value={formData.shopEmail}
                  onChange={(e) => setFormData({ ...formData, shopEmail: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres de facturation</CardTitle>
              <CardDescription>
                Configurez les paramètres par défaut pour vos factures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="defaultTaxRate">Taux de TVA par défaut (%)</Label>
                  <Input
                    id="defaultTaxRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.defaultTaxRate}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
                  <Input
                    id="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nextInvoiceNumber">Prochain numéro</Label>
                  <Input
                    id="nextInvoiceNumber"
                    type="number"
                    min="1"
                    value={formData.nextInvoiceNumber}
                    onChange={(e) => setFormData({ ...formData, nextInvoiceNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
