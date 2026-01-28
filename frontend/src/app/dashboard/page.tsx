'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = () => {
    setLoading(true);
    api.get(`/stats/dashboard?period=${period}`)
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'day': return "aujourd'hui";
      case 'week': return 'cette semaine';
      case 'month': return 'ce mois';
      case 'year': return 'cette année';
    }
  };

  if (loading || !stats) {
    return (
      <Layout>
        <div className="text-sm text-gray-500">Chargement...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Sélecteur de période */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tableau de bord</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('day')}
              className={period === 'day' ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
            >
              Jour
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={period === 'week' ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
            >
              Semaine
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={period === 'month' ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
            >
              Mois
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={period === 'year' ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
            >
              Année
            </button>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-1">Produits vendus</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.productsSold}</p>
            <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-1">Chiffre d'affaires</p>
            <p className="text-3xl font-semibold text-gray-900">
              {Number(stats.revenue).toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.invoiceCount} factures</p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-1">Clients actifs</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.clientsWithPurchases}</p>
            <p className="text-xs text-gray-500 mt-1">sur {stats.totalClients} clients</p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-1">Stock faible</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.lowStockProducts}</p>
            <p className="text-xs text-gray-500 mt-1">produits &lt; 10 unités</p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Actions rapides</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/invoices/new')}
                className="btn-primary justify-start"
              >
                Nouvelle facture
              </button>
              <button
                onClick={() => router.push('/dashboard/clients')}
                className="btn-secondary justify-start"
              >
                Ajouter un client
              </button>
              <button
                onClick={() => router.push('/dashboard/products')}
                className="btn-secondary justify-start"
              >
                Gérer le stock
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top 3 produits */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">
                Top 3 produits les plus vendus
              </h3>
              <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="p-6">
              {stats.topProducts.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune vente</p>
              ) : (
                <div className="space-y-4">
                  {stats.topProducts.map((item: any, index: number) => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-xs text-gray-500">{item.quantitySold} unités vendues</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {Number(item.revenue).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meilleurs clients */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Meilleurs clients</h3>
              <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="p-6">
              {stats.topClients.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun client</p>
              ) : (
                <div className="space-y-4">
                  {stats.topClients.map((item: any, index: number) => (
                    <div key={item.client.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.client.firstName} {item.client.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{item.invoiceCount} achats</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {Number(item.totalSpent).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
