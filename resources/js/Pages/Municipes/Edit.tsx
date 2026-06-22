import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft } from 'lucide-react'

export default function MunicipesEdit({ contact, personTypes }: any) {
  const { data, setData, patch, processing, errors } = useForm({
    name:           contact.name ?? '',
    person_type_id: contact.person_type_id ?? '',
    email:          contact.email ?? '',
    phone:          contact.phone ?? '',
    mobile:         contact.mobile ?? '',
    nif:            contact.nif ?? '',
    address:        contact.address ?? '',
    postal_code:    contact.postal_code ?? '',
    locality:       contact.locality ?? '',
    birthdate:      contact.birthdate ?? '',
    notes:          contact.notes ?? '',
    is_active:      contact.is_active ?? true,
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    patch(`/municipes/${contact.id}`, { onSuccess: () => {} })
  }

  return (
    <AdminLayout title={`Editar — ${contact.name}`}>
      <Head title={`Editar ${contact.name} — JuntaOS`}/>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href={`/municipes/${contact.id}`} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-600"/>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Editar Pessoa</h1>
        </div>

        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          <div className="p-4 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Identificação</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={data.name} onChange={e => setData('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={data.person_type_id} onChange={e => setData('person_type_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">— Sem tipo —</option>
                  {personTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                <input value={data.nif} onChange={e => setData('nif', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                <input type="date" value={data.birthdate} onChange={e => setData('birthdate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={data.is_active}
                  onChange={e => setData('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600"/>
                <label htmlFor="is_active" className="text-sm text-gray-700">Pessoa ativa</label>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={data.phone} onChange={e => setData('phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telemóvel</label>
                <input value={data.mobile} onChange={e => setData('mobile', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Morada</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Morada</label>
                <input value={data.address} onChange={e => setData('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input value={data.postal_code} onChange={e => setData('postal_code', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Localidade</label>
                <input value={data.locality} onChange={e => setData('locality', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notas</h2>
            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"/>
          </div>

          <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
            <Link href={`/municipes/${contact.id}`}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Cancelar
            </Link>
            <button type="submit" disabled={processing}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60">
              {processing ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
