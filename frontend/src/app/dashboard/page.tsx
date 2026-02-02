'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle,
  Calendar
} from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/stats/dashboard?period=${period}`)
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <Layout>
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </Layout>
    );
  }

  const periodLabels: any = {
    day: 'Aujourd\'hui',
    week: 'Cette semaine',
    month: 'Ce mois',
    year: 'Cette année',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
            <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
          </div>
          <div className="flex gap-2">
            {['day', 'week', 'month', 'year'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {periodLabels[p]}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits vendus</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.productsSold || 0}</div>
              <p className="text-xs text-muted-foreground">
                {periodLabels[period]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.revenue || 0} FCFA</div>
              <p className="text-xs text-muted-foreground">
                {periodLabels[period]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeClients || 0}</div>
              <p className="text-xs text-muted-foreground">
                {periodLabels[period]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.lowStockCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Produits à réapprovisionner
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top 3 des produits</CardTitle>
              <CardDescription>Les produits les plus vendus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topProducts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune vente pour le moment
                  </p>
                ) : (
                  stats?.topProducts?.map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.soldCount} vendus
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{product.revenue} FCFA</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 des clients</CardTitle>
              <CardDescription>Les meilleurs clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topClients?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun client pour le moment
                  </p>
                ) : (
                  stats?.topClients?.map((client: any, index: number) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {client.firstName} {client.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {client.purchaseCount} achats
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{client.totalSpent} FCFA</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {stats?.lowStockProducts?.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Alerte stock faible
              </CardTitle>
              <CardDescription>Ces produits nécessitent un réapprovisionnement</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Stock actuel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.lowStockProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.category?.name}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{product.stock} unités</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
