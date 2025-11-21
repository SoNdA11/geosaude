import React, { useState } from 'react';
import { FileText, Users, Activity, Star, Clock, LogOut, Plus, Trash2, Edit, Eye } from 'lucide-react';
import { MOCK_HISTORY } from '../../data/mockData';

const AdminUnitScreen = ({ user, units, handleLogout }) => {
  // Mock: Admin 2 gerencia Unidade 1
  const adminUnit = units.find(u => u.id === user.unitId) || units[0];
  const [section, setSection] = useState('info'); // info, team, services, news, history, reviews
  const [editData, setEditData] = useState({...adminUnit});

  const Content = () => {
      if (section === 'info') {
        return (
          <div className="max-w-2xl bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Informações da Unidade</h2>
            <div className="space-y-4">
              {['name', 'rua', 'phone', 'hours', 'target'].map(field => (
                <div key={field} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{field}</label>
                    <input 
                      className="w-full border-b border-gray-300 focus:border-emerald-500 py-1 outline-none" 
                      value={editData[field]} 
                      onChange={e => setEditData({...editData, [field]: e.target.value})}
                    />
                  </div>
                  <button className="text-emerald-600 text-sm font-bold hover:underline">Salvar</button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (section === 'team' || section === 'services' || section === 'news') {
        const items = section === 'team' ? adminUnit.doctors : (section === 'services' ? adminUnit.services : adminUnit.news);
        return (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Gerenciar {section === 'team' ? 'Equipe' : (section === 'services' ? 'Serviços' : 'Notícias')}</h2>
              <button className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"><Plus size={16}/> Adicionar</button>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="border p-3 rounded flex justify-between items-center">
                  <div>
                    <p className="font-bold">{item.name || item.title}</p>
                    <p className="text-xs text-gray-500">{item.crm || item.specialty || item.date}</p>
                  </div>
                  <div className="flex gap-2">
                    {section === 'services' && <button className="text-gray-500 hover:text-blue-500"><Eye size={18}/></button>}
                    <button className="text-gray-500 hover:text-amber-500"><Edit size={18}/></button>
                    <button className="text-gray-500 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (section === 'history') {
         return (
           <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Histórico de Edições</h2>
              <div className="space-y-2">
                {MOCK_HISTORY.map(h => (
                  <div key={h.id} className="text-sm border-b py-2">
                    <span className="font-bold text-gray-700">{h.user}</span> <span className="text-gray-500">em {h.date}</span>
                    <p className="text-gray-600">{h.action}</p>
                  </div>
                ))}
              </div>
           </div>
         );
      }

      return <div className="p-4 text-gray-500">Seção em desenvolvimento.</div>;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <div className="w-full md:w-64 bg-gray-800 text-white flex-shrink-0 md:min-h-screen">
        <div className="p-4 text-lg font-bold border-b border-gray-700">Gerenciar Unidade</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible">
          {[
            { id: 'info', label: 'Informações', icon: FileText },
            { id: 'team', label: 'Equipe Médica', icon: Users },
            { id: 'services', label: 'Serviços', icon: Activity },
            { id: 'news', label: 'Notícias', icon: Star },
            { id: 'history', label: 'Histórico', icon: Clock },
            { id: 'reviews', label: 'Avaliações', icon: Star },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-3 p-4 hover:bg-gray-700 whitespace-nowrap ${section === item.id ? 'bg-emerald-600' : ''}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
            <button onClick={handleLogout} className="text-red-500 hover:underline flex items-center gap-1"><LogOut size={16}/> Sair</button>
          </div>
          <Content />
      </div>
    </div>
  );
};

export default AdminUnitScreen;