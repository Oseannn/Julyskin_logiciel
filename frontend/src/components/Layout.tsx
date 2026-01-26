'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, logout, isAdmin } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'VENDEUSE'] },
    { name: 'Produits', href: '/dashboard/products', roles: ['ADMIN', 'VENDEUSE'] },
    { name: 'Services', href: '/dashboard/services', roles: ['ADMIN', 'VENDEUSE'] },
    { name: 'Clients', href: '/dashboard/clients', roles: ['ADMIN', 'VENDEUSE'] },
    { name: 'Factures', href: '/dashboard/invoices', roles: ['ADMIN', 'VENDEUSE'] },
    { name: 'Statistiques', href: '/dashboard/stats', roles: ['ADMIN'] },
    { name: 'Utilisateurs', href: '/dashboard/users', roles: ['ADMIN'] },
    { name: 'Paramètres', href: '/dashboard/settings', roles: ['ADMIN'] },
  ]

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(user?.role || '')
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">Jules Skin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {filteredNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {user?.firstName} {user?.lastName}
                <span className="ml-2 text-xs text-gray-500">({user?.role})</span>
              </span>
              <button onClick={handleLogout} className="btn btn-secondary text-sm">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
