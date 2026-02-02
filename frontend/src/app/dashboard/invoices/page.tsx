'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye } from 'lucide-react';
import api from '@/lib/api';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices').then((res) => {
      setInvoices(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Factures</h2>
            <p className="text-muted-foreground mt-1">{invoices.length} factures au total</p>
          </div>
          <Button onClick={() => router.push('/dashboard/invoices/new')} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Sous-total</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">Aucune facture</p>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      {invoice.client?.firstName} {invoice.client?.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{invoice.subtotal} FCFA</TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.taxAmount} FCFA
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.total} FCFA
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
