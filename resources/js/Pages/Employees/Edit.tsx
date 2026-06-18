import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft } from 'lucide-react'

const CONTRACT_TYPES = ['efetivo','termo','prestacao','estagio','outro']
const STATUS_OPTS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'ferias', label: 'Férias' },
  { value: 'ausente', label: 'Ausente' },
]

export default function EmployeeEdit({ employee, departments }: any) {
  const { data, setData, patch, processing, errors } = useForm({
    name:               employee.name ?? '',
    email:              employee.email ?? '',
    phone:              employee.phone ?? '',
    mobile:             employee.mobile ?? '',
    nif:                employee.nif ?? '',
    department_id:      employee.department_id ?? '',
    position:           employee.position ?? '',
    contract_type:      employee.contract_type ?? '',
    status:             employee.status ?? 'ativo',
    address:            employee.address ?? '',
    postal_code:        employee.postal_code ?? '',
    locality:           employee.locality ?? '',
    birthdate:          employee.birthdate ?? '',
    emergency_contact:  employee.emergency_contact ?? '',
    emergency_phone:    employee.emergency_phone ?? '',
    notes:              employee.notes ?? '',
  })

  function submit(e: React.FormEvent) { e.preventDefault(); patch(`/rh/${employee.id}`) }

  return (
    <AdminLayout title={`Editar — ${employee.name}`}>
      <Head title={`Editar ${employee.name} — JuntaOS`}/>
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href={`/rh/${employee.id}`} className="p-1.5 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} className="text-gray-600"/></Link>
          <h1 className="text-xl font-bold text-gray-900">Editar Funcionário</h1>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">RH</h2>
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
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Morada</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                <input value={data.address} onChange={e => setData('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input value={data.postal_code} onChange={e => setData('postal_code', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
              <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Localidade</label>
                <input value={data.locality} onChange={e => setData('locality', e.target.value)}
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
            <Link href={`/rh/${employee.id}`} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</Link>
            <button type="submit" disabled={processing}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60">
              {processing ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
