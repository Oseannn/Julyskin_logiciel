'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data))
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
            <h2 className="text-xl font-semibold text-gray-900">Produits</h2>
            <p className="text-sm text-gray-600 mt-1">{products.length} produits au total</p>
          </div>
          <button className="btn-primary">
            Ajouter un produit
          </button>
        </div>

        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix de vente</th>
                <th>Prix d'achat</th>
                <th>Stock</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-8">
                    Aucun produit
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="font-medium">{product.name}</td>
                    <td className="text-gray-600">{product.category?.name || '-'}</td>
                    <td>{Number(product.sellingPrice).toFixed(2)} €</td>
                    <td className="text-gray-600">{Number(product.purchasePrice).toFixed(2)} €</td>
                    <td>
                      <span className={product.stock < 10 ? 'text-red-600 font-medium' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      {product.isActive ? (
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
