import React, { FormEvent } from 'react'
import { Head, useForm } from '@inertiajs/react'

export default function Login({ errors }: { errors?: Record<string, string> }) {
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    post('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Head title="Entrar — JuntaOS" />
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white text-2xl mb-4 shadow-lg">
            🏛️
          </div>
          <h1 className="text-2xl font-bold text-gray-900">JuntaOS</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Gestão Municipal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Iniciar sessão</h2>

          {errors?.email && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.email}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="utilizador@junta.pt"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={data.password}
                onChange={e => setData('password', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={e => setData('remember', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600"
                />
                Lembrar-me
              </label>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {processing ? 'A entrar…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          JuntaOS © {new Date().getFullYear()} — Gestão Municipal
        </p>
      </div>
    </div>
  )
}
