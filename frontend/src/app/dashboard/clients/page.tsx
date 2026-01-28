'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clients')
      .then((res) => setClients(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="text-sm text-gray-500">Chargement...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Clients</h2>
            <p className="text-sm text-gray-600 mt-1">{clients.length} clients enregistrés</p>
          </div>
          <button className="btn-primary">
            Ajouter un client
          </button>
        </div>

        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Date d'inscription</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">
                    Aucun client
                  </td>
                </tr>
              ) : (
                clients.map((client: any) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="font-medium">
                      {client.firstName} {client.lastName}
                    </td>
                    <td className="text-gray-600">{client.phone}</td>
                    <td className="text-gray-600">{client.email || '-'}</td>
                    <td className="text-gray-600">
                      {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <button className="btn-ghost text-xs">
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
