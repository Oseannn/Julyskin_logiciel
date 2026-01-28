'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then((res) => setServices(res.data));
  }, []);

  const getBillingLabel = (type: string, price: number) => {
    if (type === 'PAR_MINUTE') return `${price} €/min`;
    if (type === 'PAR_HEURE') return `${price} €/h`;
    return `${price} € forfait`;
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Services</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service: any) => (
              <tr key={service.id}>
                <td className="px-6 py-4">{service.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    {service.billingType}
                  </span>
                </td>
                <td className="px-6 py-4">{getBillingLabel(service.billingType, service.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
