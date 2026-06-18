import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft } from 'lucide-react'

const CONTRACT_TYPES = ['efetivo','termo','prestacao','estagio','outro']
const STATUS_OPTS = ['ativo','inativo','ferias','ausente']

export default function EmployeeCreate({ departments }: any) {
  const { data, setData, post, processing, errors } = useForm({
    name: '', email: '', phone: '', mobile: '', nif: '',
    department_id: '', position: '', contract_type: '', employee_number: '',
    hire_date: '', address: '', postal_code: '', locality: '',
    birthdate: '', emergency_contact: '', emergency_phone: '', notes: '',
  })

  function submit(e: React.FormEvent) { e.preventDefault(); post('/rh') }

  return (
    <AdminLayout title="Novo Funcionário">
      <Head title="Novo Funcionário — JuntaOS"/>
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/rh" className="p-1.5 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} className="text-gray-600"/></Link>
          <h1 className="text-xl font-bold text-gray-900">Novo Funcionário</h1>
        </div>

        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          <div className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dados Pessoais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={data.name} onChange={e => setData('name', e.target.value)} required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={data.phone} onChange={e => setData('phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telemóvel</label>
                <input value={data.mobile} onChange={e => setData('mobile', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Informação RH</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <select value={data.department_id} onChange={e => setData('department_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Nenhum —</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Função</label>
                <input value={data.position} onChange={e => setData('position', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato</label>
                <select value={data.contract_type} onChange={e => setData('contract_type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Nenhum —</option>
                  {CONTRACT_TYPES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nº Funcionário</label>
                <input value={data.employee_number} onChange={e => setData('employee_number', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Data de entrada</label>
                <input type="date" value={data.hire_date} onChange={e => setData('hire_date', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Emergência</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input value={data.emergency_contact} onChange={e => setData('emergency_contact', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={data.emergency_phone} onChange={e => setData('emergency_phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
            </div>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"/>
          </div>

          <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
            <Link href="/rh" className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</Link>
            <button type="submit" disabled={processing}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60">
              {processing ? 'A guardar...' : 'Criar Funcionário'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
