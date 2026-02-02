'use client';

import { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Users as UsersIcon } from 'lucide-react';
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
    api.get('/clients').then((res) => {
      setClients(res.data);
    }).finally(() => setLoading(false));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        email: formData.email || undefined,
      };

      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, data);
      } else {
        await api.post('/clients', data);
      }
      
      loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

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
            <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
            <p className="text-muted-foreground mt-1">{clients.length} clients au total</p>
          </div>
          <Button onClick={() => openModal()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un client
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">Aucun client</p>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client: any) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.lastName}</TableCell>
                    <TableCell>{client.firstName}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{client.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingClient ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
