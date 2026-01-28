'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services')
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  }, []);

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
          <button className="btn-primary">
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
                    <td>{Number(service.unitPrice).toFixed(2)} €</td>
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
                      <button className="btn-ghost text-xs">
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
    </Layout>
  );
}
