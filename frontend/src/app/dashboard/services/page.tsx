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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Briefcase } from 'lucide-react';
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
    api.get('/services').then((res) => {
      setServices(res.data);
    }).finally(() => setLoading(false));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        unitPrice: parseInt(formData.unitPrice),
        minDuration: formData.minDuration ? parseInt(formData.minDuration) : null,
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, data);
      } else {
        await api.post('/services', data);
      }
      
      loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const getBillingTypeLabel = (type: string) => {
    const labels: any = {
      PAR_MINUTE: 'Par minute',
      PAR_HEURE: 'Par heure',
      FORFAIT: 'Forfait',
    };
    return labels[type] || type;
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
            <h2 className="text-3xl font-bold tracking-tight">Services</h2>
            <p className="text-muted-foreground mt-1">{services.length} services au total</p>
          </div>
          <Button onClick={() => openModal()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un service
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type de facturation</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Durée min.</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">Aucun service</p>
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service: any) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getBillingTypeLabel(service.billingType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.unitPrice} FCFA</TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.minDuration ? `${service.minDuration} min` : '-'}
                    </TableCell>
                    <TableCell>
                      {service.isActive ? (
                        <Badge variant="success">Actif</Badge>
                      ) : (
                        <Badge variant="destructive">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal(service)}
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
            <DialogTitle>{editingService ? 'Modifier le service' : 'Nouveau service'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Modifiez les informations du service' : 'Ajoutez un nouveau service'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du service</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="billingType">Type de facturation</Label>
                <select
                  id="billingType"
                  value={formData.billingType}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="FORFAIT">Forfait</option>
                  <option value="PAR_HEURE">Par heure</option>
                  <option value="PAR_MINUTE">Par minute</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">Prix unitaire (FCFA)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="1"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="minDuration">Durée min. (min)</Label>
                  <Input
                    id="minDuration"
                    type="number"
                    value={formData.minDuration}
                    onChange={(e) => setFormData({ ...formData, minDuration: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="font-normal">
                  Service actif
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingService ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
