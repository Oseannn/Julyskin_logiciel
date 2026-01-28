'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-gray-900">Julyskin</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} md:block
        fixed md:relative inset-0 z-50 md:z-auto
        w-full md:w-64 bg-white border-r border-gray-200 flex flex-col
        md:h-screen
      `}>
        {/* Desktop Header */}
        <div className="hidden md:flex h-16 items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Julyskin</h1>
        </div>

        {/* Mobile Close Button */}
        <div className="md:hidden h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Menu</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
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

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center px-4 md:px-8">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {navItems.find(item => item.href === pathname)?.label || 'Julyskin'}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
