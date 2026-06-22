import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { User, Lock, Save } from 'lucide-react'
import clsx from 'clsx'

const roleLabels: Record<string, string> = {
  admin:'Administrador', executivo:'Executivo',
  administrativo:'Administrativo', operacional:'Operacional',
}

export default function PerfilIndex({ user }: any) {
  const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    password: '',
    password_confirmation: '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    patch('/perfil')
  }

  return (
    <AdminLayout title="Meu Perfil">
      <Head title="Perfil — JuntaOS"/>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Meu Perfil</h1>

        {/* Avatar & info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              {roleLabels[user.role] ?? user.role}
            </span>
          </div>
        </div>

        {recentlySuccessful && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Perfil atualizado com sucesso.
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          {/* Info pessoal */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className="text-gray-500"/>
              <h2 className="font-semibold text-gray-800">Informação Pessoal</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input value={data.name} onChange={e => setData('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={data.phone} onChange={e => setData('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="912 000 000"/>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} className="text-gray-500"/>
              <h2 className="font-semibold text-gray-800">Alterar Password</h2>
            </div>
            <p className="text-xs text-gray-400">Deixa em branco para manter a password atual.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Password</label>
                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mínimo 8 caracteres"/>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Password</label>
                <input type="password" value={data.password_confirmation}
                  onChange={e => setData('password_confirmation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={processing}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
              <Save size={15}/> {processing ? 'A guardar…' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
