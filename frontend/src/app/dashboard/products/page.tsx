'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sellingPrice: '',
    stock: '',
    categoryId: '',
    isActive: true,
  });

  const loadData = () => {
    Promise.all([
      api.get('/products'),
      api.get('/categories'),
    ]).then(([productsRes, categoriesRes]) => {
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        categoryId: product.categoryId,
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      const firstCategoryId = categories.length > 0 ? (categories[0] as any).id : '';
      setFormData({
        name: '',
        description: '',
        sellingPrice: '',
        stock: '0',
        categoryId: firstCategoryId,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        sellingPrice: parseFloat(formData.sellingPrice),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
      } else {
        await api.post('/products', data);
      }
      
      loadData();
      closeModal();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
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
            <h2 className="text-xl font-semibold text-gray-900">Produits</h2>
            <p className="text-sm text-gray-600 mt-1">{products.length} produits au total</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary">
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
                <th>Stock</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-8">
                    Aucun produit
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="font-medium">{product.name}</td>
                    <td className="text-gray-600">{product.category?.name || '-'}</td>
                    <td>{Number(product.sellingPrice).toFixed(2)} FCFA</td>
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
                      <button onClick={() => openModal(product)} className="btn-ghost text-xs">
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
        title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Nom du produit</label>
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
            <label htmlFor="categoryId" className="label">Catégorie</label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="input"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sellingPrice" className="label">Prix de vente (FCFA)</label>
            <input
              id="sellingPrice"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="stock" className="label">Stock</label>
            <input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="input"
              required
            />
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
              Produit actif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingProduct ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
