import React, { useState, useEffect } from 'react';
import { FileText, Users, Activity, Star, Clock, LogOut, Plus, Trash2 } from 'lucide-react';
import { MOCK_HISTORY } from '../../data/mockData';

const AdminUnitScreen = ({ user, units, handleLogout, onUpdateUnit, onAddItem, onDeleteItem }) => {
  // Encontra a unidade específica que este administrador gerencia (ou a primeira por padrão)
  const adminUnit = units.find(u => u.id === user.unitId) || units[0];
  
  const [section, setSection] = useState('info'); // info, services, news, history
  
  // Estado local para controlar os inputs de edição da unidade
  const [infoForm, setInfoForm] = useState({});

  // Sincroniza o formulário local sempre que os dados globais do banco forem atualizados
  useEffect(() => {
    if (adminUnit) {
      setInfoForm({
        name: adminUnit.name,
        phone: adminUnit.phone,
        hours: adminUnit.hours,
        target: adminUnit.target,
        rua: adminUnit.rua
      });
    }
  }, [adminUnit]);

  // Estados para controlar a exibição e os dados de novos cadastros
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({ name: '', specialty: '', doctor: '', description: '', hours: '' });
  const [newNews, setNewNews] = useState({ title: '', content: '' });

  // Dispara o UPDATE do campo específico no Supabase
  const handleSaveField = (field) => {
    onUpdateUnit(adminUnit.id, { [field]: infoForm[field] });
  };

  // Dispara o CREATE de um serviço ou notícia atrelado a esta unidade
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (section === 'services') {
      await onAddItem('services', { ...newService, unit_id: adminUnit.id });
      setNewService({ name: '', specialty: '', doctor: '', description: '', hours: '' });
    } else if (section === 'news') {
      const today = new Date().toLocaleDateString('pt-BR');
      await onAddItem('news', { ...newNews, unit_id: adminUnit.id, date: today });
      setNewNews({ title: '', content: '' });
    }
    setShowAddForm(false);
  };

  const Content = () => {
    if (section === 'info') {
      return (
        <div className="max-w-2xl bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Informações Gerais ({adminUnit.type})</h2>
          <div className="space-y-4">
            {[
              { field: 'name', label: 'Nome da Unidade' },
              { field: 'rua', label: 'Endereço / Rua' },
              { field: 'phone', label: 'Telefone de Contato' },
              { field: 'hours', label: 'Horário de Funcionamento' },
              { field: 'target', label: 'Público-Alvo' }
            ].map(({ field, label }) => (
              <div key={field} className="flex items-end gap-4 border-b border-gray-100 pb-2">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
                  <input 
                    className="w-full py-1 outline-none text-gray-800 focus:text-emerald-600 font-medium bg-transparent" 
                    value={infoForm[field] || ''} 
                    onChange={e => setInfoForm({...infoForm, [field]: e.target.value})}
                  />
                </div>
                <button 
                  onClick={() => handleSaveField(field)}
                  className="text-emerald-600 text-sm font-bold hover:text-emerald-800 transition"
                >
                  Salvar
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section === 'services' || section === 'news') {
      const items = section === 'services' ? adminUnit.services : adminUnit.news;
      return (
        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Gerenciar {section === 'services' ? 'Serviços Oferecidos' : 'Notícias e Avisos'}
            </h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-emerald-700 transition"
            >
              <Plus size={16}/> {showAddForm ? 'Cancelar' : 'Adicionar Novo'}
            </button>
          </div>

          {/* Formuário de Cadastro (Injetado dinamicamente via estado) */}
          {showAddForm && (
            <form onSubmit={handleCreateItem} className="bg-gray-50 p-4 rounded-lg border mb-6 space-y-3 animate-fade-in">
              <h3 className="font-bold text-gray-700 text-sm border-b pb-1">Novo {section === 'services' ? 'Serviço' : 'Aviso'}</h3>
              {section === 'services' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Nome do Serviço (ex: Consulta Pediátrica)" required className="border p-2 rounded text-sm w-full bg-white" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                  <input type="text" placeholder="Especialidade (ex: Pediatria)" required className="border p-2 rounded text-sm w-full bg-white" value={newService.specialty} onChange={e => setNewService({...newService, specialty: e.target.value})} />
                  <input type="text" placeholder="Médico / Responsável" className="border p-2 rounded text-sm w-full bg-white" value={newService.doctor} onChange={e => setNewService({...newService, doctor: e.target.value})} />
                  <input type="text" placeholder="Horários (ex: Terças, 07h às 11h)" className="border p-2 rounded text-sm w-full bg-white" value={newService.hours} onChange={e => setNewService({...newService, hours: e.target.value})} />
                  <textarea placeholder="Breve descrição do serviço para os cidadãos..." className="border p-2 rounded text-sm w-full md:col-span-2 h-16 bg-white" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="text" placeholder="Título do Aviso ou Campanha" required className="border p-2 rounded text-sm w-full bg-white" value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} />
                  <textarea placeholder="Conteúdo detalhado da notícia..." required className="border p-2 rounded text-sm w-full h-24 bg-white" value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} />
                </div>
              )}
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-emerald-700 transition">Confirmar Cadastro no Banco</button>
            </form>
          )}

          {/* Lista de registros reais vindo do Supabase */}
          <div className="space-y-2">
            {items.length === 0 && <p className="text-gray-500 italic text-sm">Nenhum registro encontrado para esta unidade no banco de dados.</p>}
            {items.map(item => (
              <div key={item.id} className="border p-3 rounded-lg flex justify-between items-center hover:bg-gray-50 transition">
                <div>
                  <p className="font-bold text-gray-800">{item.name || item.title}</p>
                  <p className="text-xs text-gray-500">{item.specialty || item.date} {item.doctor ? `• ${item.doctor}` : ''}</p>
                </div>
                <button 
                  onClick={() => onDeleteItem(section, item.id)}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded transition"
                  title="Excluir permanentemente do banco"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section === 'history') {
       return (
         <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Histórico de Alterações</h2>
            <div className="space-y-2">
              {MOCK_HISTORY.map(h => (
                <div key={h.id} className="text-sm border-b border-gray-100 py-2 last:border-0">
                  <span className="font-bold text-gray-700">{h.user}</span> <span className="text-gray-400 font-normal">em {h.date}</span>
                  <p className="text-gray-600 mt-0.5">{h.action}</p>
                </div>
              ))}
            </div>
         </div>
       );
    }

    return <div className="p-4 text-gray-500">Seção não configurada.</div>;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar de Navegação Interna */}
      <div className="w-full md:w-64 bg-gray-800 text-white flex-shrink-0 md:min-h-screen shadow-xl">
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h3 className="font-bold text-emerald-400 text-sm truncate">{adminUnit?.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Painel Gestor Ativo</p>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible">
          {[
            { id: 'info', label: 'Informações', icon: FileText },
            { id: 'services', label: 'Serviços', icon: Activity },
            { id: 'news', label: 'Notícias / Avisos', icon: Star },
            { id: 'history', label: 'Histórico', icon: Clock },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setSection(item.id); setShowAddForm(false); }}
              className={`flex items-center gap-3 p-4 w-full text-left hover:bg-gray-700 transition whitespace-nowrap md:whitespace-normal ${section === item.id ? 'bg-emerald-600 border-l-4 border-emerald-300 font-medium' : ''}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Container Principal */}
      <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Geosaúde Mossoró</h1>
              <p className="text-sm text-gray-500">Operador: {user.name}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 bg-white px-3 py-1.5 rounded shadow-sm border border-red-100 hover:shadow transition"
            >
              <LogOut size={16}/> Sair
            </button>
          </div>
          <Content />
      </div>
    </div>
  );
};

export default AdminUnitScreen;