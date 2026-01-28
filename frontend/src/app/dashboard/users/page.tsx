'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then((res) => setUsers(res.data))
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
            <h2 className="text-xl font-semibold text-gray-900">Utilisateurs</h2>
            <p className="text-sm text-gray-600 mt-1">{users.length} utilisateurs</p>
          </div>
          <button className="btn-primary">
            Ajouter un utilisateur
          </button>
        </div>

        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="text-gray-600">{user.email}</td>
                  <td>
                    <span className={user.role === 'ADMIN' ? 'badge-error' : 'badge-info'}>
                      {user.role === 'ADMIN' ? 'Administrateur' : 'Vendeuse'}
                    </span>
                  </td>
                  <td>
                    {user.isActive ? (
                      <span className="badge-success">Actif</span>
                    ) : (
                      <span className="badge-error">Inactif</span>
                    )}
                  </td>
                  <td className="text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <button className="btn-ghost text-xs">
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
