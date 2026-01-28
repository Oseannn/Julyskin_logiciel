'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const loadData = () => {
    api.get('/clients')
      .then((res) => setClients(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (client?: any) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        email: formData.email || null,
      };

      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, data);
      } else {
        await api.post('/clients', data);
      }
      
      loadData();
      closeModal();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    }
  };

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
          <button onClick={() => openModal()} className="btn-primary">
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
                      <button onClick={() => openModal(client)} className="btn-ghost text-xs">
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="label">Prénom</label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="label">Nom</label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="label">Téléphone</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
              placeholder="06 12 34 56 78"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email (optionnel)</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="client@exemple.com"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingClient ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
