'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    invoicesToday: 0,
    revenueMonth: 0,
    clientsTotal: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    // Charger les stats réelles ici
    // Pour l'instant, valeurs par défaut
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-1">Factures aujourd'hui</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.invoicesToday}</p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-1">CA du mois</p>
            <p className="text-3xl font-semibold text-gray-900">
              {stats.revenueMonth.toLocaleString('fr-FR')} €
            </p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-1">Clients</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.clientsTotal}</p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-1">Produits en rupture</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.lowStockProducts}</p>
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

        {/* Dernières factures */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Dernières factures</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">Aucune facture récente</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
