'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await api.put('/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <Layout>
        <div className="text-sm text-gray-500">Chargement...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Paramètres</h2>
          <p className="text-sm text-gray-600 mt-1">Configuration de l'application</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Informations de la boutique</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="shopName" className="label">
                  Nom de la boutique
                </label>
                <input
                  id="shopName"
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="shopAddress" className="label">
                  Adresse
                </label>
                <input
                  id="shopAddress"
                  type="text"
                  value={settings.shopAddress || ''}
                  onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="shopPhone" className="label">
                    Téléphone
                  </label>
                  <input
                    id="shopPhone"
                    type="tel"
                    value={settings.shopPhone || ''}
                    onChange={(e) => setSettings({ ...settings, shopPhone: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="shopEmail" className="label">
                    Email
                  </label>
                  <input
                    id="shopEmail"
                    type="email"
                    value={settings.shopEmail || ''}
                    onChange={(e) => setSettings({ ...settings, shopEmail: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Facturation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invoicePrefix" className="label">
                    Préfixe des factures
                  </label>
                  <input
                    id="invoicePrefix"
                    type="text"
                    value={settings.invoicePrefix}
                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="defaultTaxRate" className="label">
                    Taux de TVA par défaut (%)
                  </label>
                  <input
                    id="defaultTaxRate"
                    type="number"
                    step="0.01"
                    value={settings.defaultTaxRate}
                    onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {saved && (
              <span className="text-sm text-green-600 flex items-center">
                Paramètres enregistrés
              </span>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
