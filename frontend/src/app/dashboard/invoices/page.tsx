'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api.get('/invoices').then((res) => setInvoices(res.data));
  }, []);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Factures</h1>
        <button
          onClick={() => router.push('/dashboard/invoices/new')}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Nouvelle facture
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice: any) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4">{invoice.client.firstName} {invoice.client.lastName}</td>
                <td className="px-6 py-4">{invoice.total} €</td>
                <td className="px-6 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
