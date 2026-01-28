'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices')
      .then((res) => setInvoices(res.data))
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
            <h2 className="text-xl font-semibold text-gray-900">Factures</h2>
            <p className="text-sm text-gray-600 mt-1">{invoices.length} factures émises</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/invoices/new')}
            className="btn-primary"
          >
            Nouvelle facture
          </button>
        </div>

        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant HT</th>
                <th>TVA</th>
                <th>Total TTC</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-8">
                    Aucune facture
                  </td>
                </tr>
              ) : (
                invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="font-medium font-mono text-sm">
                      {invoice.invoiceNumber}
                    </td>
                    <td>
                      {invoice.client.firstName} {invoice.client.lastName}
                    </td>
                    <td className="text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td>{invoice.subtotal} FCFA</td>
                    <td className="text-gray-600">
                      {invoice.taxAmount} FCFA
                    </td>
                    <td className="font-medium">
                      {invoice.total} FCFA
                    </td>
                    <td>
                      <button className="btn-ghost text-xs">
                        Voir
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
