import React, { useState } from 'react';
import { MOCK_USERS, MOCK_HISTORY } from '../../data/mockData';

const AdminSystemScreen = ({ units, setSelectedUnit, setView, handleLogout }) => {
  const [sysSection, setSysSection] = useState('units'); // units, admins, history

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-emerald-900">Administração do Sistema</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div onClick={() => setSysSection('units')} className="bg-white p-6 rounded shadow hover:shadow-md cursor-pointer border-l-4 border-emerald-600">
          <h3 className="font-bold text-lg">Gerenciar Unidades</h3>
        </div>
        <div onClick={() => setSysSection('admins')} className="bg-white p-6 rounded shadow hover:shadow-md cursor-pointer border-l-4 border-emerald-600">
          <h3 className="font-bold text-lg">Gerenciar Admins</h3>
        </div>
        <div onClick={() => setSysSection('history')} className="bg-white p-6 rounded shadow hover:shadow-md cursor-pointer border-l-4 border-emerald-600">
          <h3 className="font-bold text-lg">Histórico Global</h3>
        </div>
        <div className="bg-emerald-600 text-white p-6 rounded shadow hover:bg-emerald-700 cursor-pointer flex items-center justify-center font-bold">
          + Criar Unidade
        </div>
      </div>

      {sysSection === 'units' && (
        <div className="space-y-2 mt-6">
          <h2 className="font-bold text-xl">Unidades Cadastradas</h2>
          {units.map(u => (
            <div key={u.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{u.name}</h4>
                  <p className="text-sm text-gray-600">{u.type} • Admin: Marcos Nunes (Mock)</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedUnit(u); setView('details'); }} className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">Visualizar</button>
                  <button className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs">Editar</button>
                  <button className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs">Excluir</button>
                </div>
            </div>
          ))}
        </div>
      )}
      
      {sysSection === 'admins' && (
        <div className="bg-white p-6 rounded shadow mt-6">
            <h2 className="font-bold text-xl mb-4">Administradores de Unidade</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b"><th className="pb-2">Nome</th><th className="pb-2">Email</th><th className="pb-2">Unidade</th></tr>
              </thead>
              <tbody>
                {MOCK_USERS.filter(u => u.role === 'unit_admin').map(u => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">UBS Centro Clínico</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {sysSection === 'history' && (
          <div className="bg-white p-6 rounded shadow mt-6">
            <h2 className="font-bold text-xl mb-4">Histórico Global</h2>
            {MOCK_HISTORY.map(h => (
              <div key={h.id} className="border-b py-2">
                <p className="text-sm"><strong>{h.user}</strong> - {h.action} <span className="text-gray-400">({h.unit})</span></p>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default AdminSystemScreen;