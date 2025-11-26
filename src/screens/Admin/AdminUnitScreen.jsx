import React, { useState } from 'react';
import { FileText, Users, Activity, Star, Clock, LogOut, Plus, Trash2, Edit, Eye, ChevronRight, LayoutDashboard } from 'lucide-react';
import { MOCK_HISTORY } from '../../data/mockData';

const AdminUnitScreen = ({ user, units, handleLogout }) => {
  const adminUnit = units.find(u => u.id === user.unitId) || units[0]; 
  const [section, setSection] = useState('info'); 
  const [editData, setEditData] = useState({...adminUnit});

  const menuItems = [
    { id: 'info', label: 'Informações Gerais', icon: FileText },
    { id: 'team', label: 'Corpo Clínico', icon: Users },
    { id: 'services', label: 'Serviços Ofertados', icon: Activity },
    { id: 'news', label: 'Notícias e Avisos', icon: Star },
    { id: 'history', label: 'Histórico de Logs', icon: Clock },
  ];

  const Content = () => {
      if (section === 'info') {
        return (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl animate-fade-in">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
               <h2 className="text-xl font-bold text-gray-800">Dados da Unidade</h2>
               <button className="text-emerald-600 text-sm font-bold hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors">Salvar Alterações</button>
            </div>
            <div className="space-y-6">
              {['name', 'rua', 'phone', 'hours', 'target'].map(field => (
                <div key={field} className="group">
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-emerald-600 transition-colors">
                     {field === 'name' ? 'Nome da Unidade' : field === 'rua' ? 'Endereço' : field}
                   </label>
                   <input 
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-gray-700 font-medium" 
                     value={editData[field]} 
                     onChange={e => setEditData({...editData, [field]: e.target.value})}
                   />
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (section === 'team' || section === 'services' || section === 'news') {
        const items = section === 'team' ? adminUnit.doctors : (section === 'services' ? adminUnit.services : adminUnit.news);
        return (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-800">
                 {section === 'team' ? 'Gestão de Médicos' : (section === 'services' ? 'Catálogo de Serviços' : 'Mural de Avisos')}
              </h2>
              <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-all shadow-lg shadow-gray-200">
                <Plus size={18}/> Adicionar Novo
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {items.map(item => (
                <div key={item.id} className="border border-gray-100 p-5 rounded-2xl flex justify-between items-center hover:border-emerald-200 hover:shadow-md transition-all group bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {section === 'team' ? 'DR' : section === 'services' ? 'SV' : 'NT'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{item.name || item.title}</p>
                      <p className="text-xs text-gray-500">{item.crm || item.specialty || item.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit size={18}/></button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return <div className="p-8 text-gray-400">Seção em construção...</div>;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
      <div className="w-full md:w-72 bg-white border-r border-gray-200 flex-shrink-0 md:min-h-screen flex flex-col">
        <div className="p-8 border-b border-gray-50">
           <div className="flex items-center gap-3 text-emerald-700 mb-1">
             <LayoutDashboard size={24} />
             <span className="font-bold text-lg">Gestão Local</span>
           </div>
           <p className="text-xs text-gray-400 pl-9">Painel da Unidade</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-all ${
                section === item.id 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' 
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={section === item.id ? 'text-emerald-600' : 'text-gray-400'} />
                {item.label}
              </div>
              {section === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
             <p className="text-xs font-bold text-gray-500 uppercase mb-1">Unidade Logada</p>
             <p className="text-sm font-bold text-gray-800 truncate">{adminUnit.name}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={18}/> Sair do Painel
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
         <div className="max-w-5xl mx-auto">
           <Content />
         </div>
      </div>
    </div>
  );
};

export default AdminUnitScreen;