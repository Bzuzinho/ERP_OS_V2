import React from 'react'
import { Head, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'

export default function NotFound() {
  return (
    <AdminLayout>
      <Head title="404 — JuntaOS" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <p className="text-8xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">Página não encontrada</h1>
        <p className="text-gray-500 mb-8">A página que procura não existe ou foi removida.</p>
        <Link href="/" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">Voltar ao Dashboard</Link>
      </div>
    </AdminLayout>
  )
}
