'use client';

import Layout from '@/components/Layout';

export default function DashboardPage() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Factures du jour</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Chiffre d'affaires</h3>
          <p className="text-3xl font-bold text-green-600">0 €</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Clients</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
      </div>
    </Layout>
  );
}
