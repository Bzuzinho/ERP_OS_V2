import React from 'react'
import { Head } from '@inertiajs/react'
import MainLayout from '@/Layouts/MainLayout'

export default function OrdersIndex() {
  return (
    <MainLayout>
      <Head title="Pedidos" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Pedidos</h1>

          <div className="card">
            <p className="text-gray-600">
              🚧 Página em desenvolvimento. Em breve você poderá gerenciar pedidos aqui.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
