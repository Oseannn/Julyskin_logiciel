'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/settings', settings);
      alert('Paramètres mis à jour');
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <Layout><div>Chargement...</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom de la boutique</label>
          <input
            type="text"
            value={settings.shopName}
            onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adresse</label>
          <input
            type="text"
            value={settings.shopAddress || ''}
            onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            type="text"
            value={settings.shopPhone || ''}
            onChange={(e) => setSettings({ ...settings, shopPhone: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={settings.shopEmail || ''}
            onChange={(e) => setSettings({ ...settings, shopEmail: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Taux de TVA par défaut (%)</label>
          <input
            type="number"
            value={settings.defaultTaxRate}
            onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </Layout>
  );
}
