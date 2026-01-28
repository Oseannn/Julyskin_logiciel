'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!user) {
      api.get('/users').then(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
      }).catch(() => {
        router.push('/login');
      });
    }
  }, [user, setUser, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord' },
    { href: '/dashboard/invoices', label: 'Factures' },
    { href: '/dashboard/products', label: 'Produits' },
    { href: '/dashboard/services', label: 'Services' },
    { href: '/dashboard/clients', label: 'Clients' },
    ...(user?.role === 'ADMIN' ? [{ href: '/dashboard/users', label: 'Utilisateurs' }] : []),
    { href: '/dashboard/settings', label: 'Paramètres' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Julyskin</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {user.role === 'ADMIN' ? 'Administrateur' : 'Vendeuse'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn-ghost w-full text-sm"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {navItems.find(item => item.href === pathname)?.label || 'Julyskin'}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
