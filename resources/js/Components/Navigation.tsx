import React from 'react'
import { Link } from '@inertiajs/react'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <nav className="bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏛️</span>
            <span className="font-bold text-lg hidden sm:inline">Junta Operacional</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="hover:text-primary-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/tarefas"
              className="hover:text-primary-100 transition-colors"
            >
              Tarefas
            </Link>
            <Link
              href="/pedidos"
              className="hover:text-primary-100 transition-colors"
            >
              Pedidos
            </Link>
            <Link
              href="/settings"
              className="hover:text-primary-100 transition-colors"
            >
              Configurações
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block hover:text-primary-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/tarefas"
              className="block hover:text-primary-100 transition-colors"
            >
              Tarefas
            </Link>
            <Link
              href="/pedidos"
              className="block hover:text-primary-100 transition-colors"
            >
              Pedidos
            </Link>
            <Link
              href="/settings"
              className="block hover:text-primary-100 transition-colors"
            >
              Configurações
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
