'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    api.get('/clients').then((res) => setClients(res.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Clients</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.map((client: any) => (
              <tr key={client.id}>
                <td className="px-6 py-4">{client.firstName} {client.lastName}</td>
                <td className="px-6 py-4">{client.phone}</td>
                <td className="px-6 py-4">{client.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
