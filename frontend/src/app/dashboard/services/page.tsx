'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    billingType: 'FORFAIT',
    unitPrice: '',
    minDuration: '',
    isActive: true,
  });

  const loadData = () => {
    api.get('/services')
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (service?: any) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        billingType: service.billingType,
        unitPrice: service.unitPrice,
        minDuration: service.minDuration || '',
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        billingType: 'FORFAIT',
        unitPrice: '',
        minDuration: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        minDuration: formData.minDuration ? parseInt(formData.minDuration) : null,
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, data);
      } else {
        await api.post('/services', data);
      }
      
      loadData();
      closeModal();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const getBillingLabel = (type: string) => {
    switch (type) {
      case 'PAR_MINUTE': return 'Par minute';
      case 'PAR_HEURE': return 'Par heure';
      case 'FORFAIT': return 'Forfait';
      default: return type;
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
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
            <p className="text-sm text-gray-600 mt-1">{services.length} services disponibles</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary">
            Ajouter un service
          </button>
        </div>

        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type de facturation</th>
                <th>Prix unitaire</th>
                <th>Durée min.</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-8">
                    Aucun service
                  </td>
                </tr>
              ) : (
                services.map((service: any) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="font-medium">{service.name}</td>
                    <td>
                      <span className="badge-info">
                        {getBillingLabel(service.billingType)}
                      </span>
                    </td>
                    <td>{Number(service.unitPrice).toFixed(2)} FCFA</td>
                    <td className="text-gray-600">
                      {service.minDuration ? `${service.minDuration} min` : '-'}
                    </td>
                    <td>
                      {service.isActive ? (
                        <span className="badge-success">Actif</span>
                      ) : (
                        <span className="badge-error">Inactif</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => openModal(service)} className="btn-ghost text-xs">
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
        title={editingService ? 'Modifier le service' : 'Nouveau service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Nom du service</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="billingType" className="label">Type de facturation</label>
            <select
              id="billingType"
              value={formData.billingType}
              onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
              className="input"
              required
            >
              <option value="FORFAIT">Forfait</option>
              <option value="PAR_MINUTE">Par minute</option>
              <option value="PAR_HEURE">Par heure</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="unitPrice" className="label">
                Prix unitaire (FCFA)
                {formData.billingType === 'PAR_MINUTE' && ' / minute'}
                {formData.billingType === 'PAR_HEURE' && ' / heure'}
              </label>
              <input
                id="unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="minDuration" className="label">Durée minimale (min)</label>
              <input
                id="minDuration"
                type="number"
                value={formData.minDuration}
                onChange={(e) => setFormData({ ...formData, minDuration: e.target.value })}
                className="input"
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-pink-700 focus:ring-pink-700 border-gray-300"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Service actif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingService ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
