import React, { ReactNode } from 'react'
import { Link } from '@inertiajs/react'
import Navigation from '@/Components/Navigation'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="py-4">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2024 Junta Operacional. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
