import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Users, Activity, Star, Clock, LogOut, Plus, Trash2, Edit, ChevronRight, LayoutDashboard } from 'lucide-react';
import { api } from '../../utils/api';
import ModalWrapper from '../../components/ModalWrapper';

const AdminUnitScreen = ({ user, units, handleLogout, refreshUnits }) => {
  const [adminUnit, setAdminUnit] = useState(null);
  const [section, setSection] = useState('info'); 
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para CRUD de Serviços e Notícias
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: '', specialty: '', doctor_id: '', description: '', hours: '' });

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', date: '', expires_at: '' });

  // Estados para CRUD de Médicos (Corpo Clínico)
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({ name: '', specialty: '', crm: '' });

  const [historyData, setHistoryData] = useState([]);

  // Recarregar os detalhes da unidade via API
  const fetchLatestUnitData = useCallback(async (isInitial = false) => {
    const targetUnitId = user?.unitId || 1;
    try {
      if (isInitial) {
        setLoading(true);
      }
      const data = await api.getUnitById(targetUnitId);
      setAdminUnit(data);
      setEditData({ ...data });

      // Carregar logs do histórico
      const logs = await api.getHistory();
      // Filtrar logs apenas para esta unidade
      const filteredLogs = logs.filter(log => log.unit === data.name || log.details?.unit_id === Number(data.id));
      setHistoryData(filteredLogs);
    } catch (err) {
      console.error('Erro ao buscar dados atualizados da unidade:', err);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [user?.unitId]);

  useEffect(() => {
    fetchLatestUnitData(true);
  }, [fetchLatestUnitData]);

  const handleSaveInfo = async () => {
    try {
      const payload = {
        name: editData.name,
        rua: editData.rua,
        phone: editData.phone,
        hours: editData.hours,
        target: editData.target,
        bairro: editData.bairro,
        cep: editData.cep,
        lat: editData.lat ? Number(editData.lat) : undefined,
        lng: editData.lng ? Number(editData.lng) : undefined,
        urgency: editData.urgency,
        open24h: editData.open24h
      };

      const updated = await api.updateUnit(adminUnit.id, payload);
      setAdminUnit(updated);
      setEditData({ ...updated });
      alert('Informações gerais salvas com sucesso!');
      if (refreshUnits) {
        await refreshUnits();
      }
      await fetchLatestUnitData();
    } catch (err) {
      alert(err.message || 'Erro ao salvar alterações.');
    }
  };

  // CRUD de Serviços
  const openAddServiceModal = () => {
    setSelectedService(null);
    setServiceForm({ name: '', specialty: '', doctor_id: '', description: '', hours: '' });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name || '',
      specialty: service.specialty || '',
      doctor_id: service.doctor_id ? String(service.doctor_id) : '',
      description: service.description || '',
      hours: service.hours || ''
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.specialty.trim() || !serviceForm.doctor_id || !serviceForm.description.trim() || !serviceForm.hours.trim()) {
      alert('Todos os campos (Nome, Especialidade, Profissional Responsável, Descrição e Horários) são obrigatórios.');
      return;
    }
    try {
      const payload = {
        name: serviceForm.name.trim(),
        specialty: serviceForm.specialty.trim(),
        doctor_id: Number(serviceForm.doctor_id),
        description: serviceForm.description.trim(),
        hours: serviceForm.hours.trim()
      };
      if (selectedService) {
        await api.updateService(selectedService.id, payload);
      } else {
        await api.createService(adminUnit.id, payload);
      }
      setIsServiceModalOpen(false);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      alert(err.message || 'Erro ao salvar serviço.');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este serviço?')) return;
    try {
      await api.deleteService(id);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      alert(err.message || 'Erro ao remover serviço.');
    }
  };

  // CRUD de Médicos (Corpo Clínico)
  const openAddDoctorModal = () => {
    setSelectedDoctor(null);
    setDoctorForm({ name: '', specialty: '', crm: '' });
    setIsDoctorModalOpen(true);
  };

  const openEditDoctorModal = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorForm({
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      crm: doctor.crm || ''
    });
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!doctorForm.name.trim() || !doctorForm.specialty.trim() || !doctorForm.crm.trim()) {
      alert('Todos os campos (Nome, Especialidade e CRM) são obrigatórios.');
      return;
    }
    try {
      const payload = {
        name: doctorForm.name.trim(),
        specialty: doctorForm.specialty.trim(),
        crm: doctorForm.crm.trim()
      };
      if (selectedDoctor) {
        await api.updateDoctor(selectedDoctor.id, payload);
      } else {
        await api.createDoctor(adminUnit.id, payload);
      }
      setIsDoctorModalOpen(false);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      alert(err.message || 'Erro ao salvar profissional.');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este médico? Todos os serviços que o referenciam ficarão sem responsável.')) return;
    try {
      await api.deleteDoctor(id);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      alert(err.message || 'Erro ao remover profissional.');
    }
  };

  // CRUD de Notícias
  const openAddNewsModal = () => {
    setSelectedNews(null);
    setNewsForm({ title: '', content: '', date: new Date().toLocaleDateString('pt-BR'), expires_at: '' });
    setIsNewsModalOpen(true);
  };

  const openEditNewsModal = (item) => {
    setSelectedNews(item);
    setNewsForm({
      title: item.title || '',
      content: item.content || '',
      date: item.date || '',
      expires_at: item.expires_at ? item.expires_at.split('T')[0] : ''
    });
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.content.trim() || !newsForm.date.trim() || !newsForm.expires_at) {
      alert('Todos os campos (Título, Conteúdo, Data Exibida e Prazo Limite) são obrigatórios.');
      return;
    }
    try {
      const payload = {
        title: newsForm.title.trim(),
        content: newsForm.content.trim(),
        date: newsForm.date.trim(),
        expires_at: new Date(newsForm.expires_at).toISOString()
      };
      if (selectedNews) {
        await api.updateNews(selectedNews.id, payload);
      } else {
        await api.createNews(adminUnit.id, payload);
      }
      setIsNewsModalOpen(false);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      alert(err.message || 'Erro ao salvar notícia.');
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este aviso?')) return;
    try {
      await api.deleteNews(id);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      alert(err.message || 'Erro ao remover notícia.');
    }
  };

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

  const renderContent = () => {
    if (section === 'info') {
      return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl animate-fade-in">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
             <h2 className="text-xl font-bold text-gray-800">Dados da Unidade</h2>
             <button 
               onClick={handleSaveInfo}
               className="text-white bg-emerald-600 hover:bg-emerald-700 font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 text-sm"
             >
               Salvar Alterações
             </button>
          </div>
          <div className="space-y-6">
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Nome da Unidade</label>
               <input 
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-gray-700 font-medium" 
                 value={editData.name || ''} 
                 onChange={e => setEditData({ ...editData, name: e.target.value })}
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Bairro</label>
               <input 
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-gray-700 font-medium" 
                 value={editData.bairro || ''} 
                 onChange={e => setEditData({ ...editData, bairro: e.target.value })}
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Endereço (Rua)</label>
               <input 
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-gray-700 font-medium" 
                 value={editData.rua || ''} 
                 onChange={e => setEditData({ ...editData, rua: e.target.value })}
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Telefone</label>
               <input 
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-gray-700 font-medium" 
                 value={editData.phone || ''} 
                 onChange={e => setEditData({ ...editData, phone: e.target.value })}
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Horário</label>
               <input 
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-gray-700 font-medium" 
                 value={editData.hours || ''} 
                 onChange={e => setEditData({ ...editData, hours: e.target.value })}
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Público Alvo</label>
               <input 
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-gray-700 font-medium" 
                 value={editData.target || ''} 
                 onChange={e => setEditData({ ...editData, target: e.target.value })}
               />
            </div>
          </div>
        </div>
      );
    }

    if (section === 'team') {
      const doctors = adminUnit.doctors || [];
      return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Corpo Clínico (Médicos)</h2>
              <p className="text-xs text-gray-400 mt-1">Gerencie os profissionais de saúde cadastrados nesta unidade.</p>
            </div>
            <button 
              onClick={openAddDoctorModal}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              <Plus size={18}/> Adicionar Médico
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {doctors.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">Nenhum profissional médico cadastrado nesta unidade.</p>
            ) : (
              doctors.map(doc => (
                <div key={doc.id} className="border border-gray-100 p-5 rounded-2xl flex justify-between items-center hover:border-emerald-200 hover:shadow-md transition-all group bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      DR
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{doc.name}</p>
                      <p className="text-xs text-emerald-600 font-medium">{doc.specialty} {doc.crm && ` • ${doc.crm}`}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditDoctorModal(doc)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    >
                      <Edit size={18}/>
                    </button>
                    <button 
                      onClick={() => handleDeleteDoctor(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (section === 'services') {
      const services = adminUnit.services || [];
      return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Catálogo de Serviços</h2>
            <button 
              onClick={openAddServiceModal}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              <Plus size={18}/> Adicionar Serviço
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {services.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">Nenhum serviço catalogado nesta unidade.</p>
            ) : (
              services.map(item => (
                <div key={item.id} className="border border-gray-100 p-5 rounded-2xl flex justify-between items-center hover:border-emerald-200 hover:shadow-md transition-all group bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm font-mono">
                      SV
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.specialty} {item.doctor && ` • Resp: ${item.doctor}`} {item.hours && ` • Horário: ${item.hours}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditServiceModal(item)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    >
                      <Edit size={18}/>
                    </button>
                    <button 
                      onClick={() => handleDeleteService(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (section === 'news') {
      const news = adminUnit.news || [];
      return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Mural de Avisos e Notícias</h2>
            <button 
              onClick={openAddNewsModal}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              <Plus size={18}/> Criar Comunicado
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {news.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">Nenhum comunicado cadastrado no mural.</p>
            ) : (
              news.map(item => (
                <div key={item.id} className="border border-gray-100 p-5 rounded-2xl flex justify-between items-center hover:border-emerald-200 hover:shadow-md transition-all group bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                      NT
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.date} {item.expires_at && ` • Expira em: ${new Date(item.expires_at).toLocaleDateString('pt-BR')}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 max-w-xl line-clamp-1">{item.content}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditNewsModal(item)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    >
                      <Edit size={18}/>
                    </button>
                    <button 
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (section === 'history') {
      return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Log de Alterações da Unidade</h2>
          <div className="divide-y divide-gray-50">
            {historyData.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">Nenhum log registrado para esta unidade.</p>
            ) : (
              historyData.map(log => (
                <div key={log.id} className="py-4 flex justify-between items-start gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{log.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Realizado por: <span className="font-medium text-gray-600">{log.user}</span></p>
                  </div>
                  <span className="text-[11px] font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded shrink-0">
                    {new Date(log.date).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return <div className="p-8 text-gray-400">Seção em construção...</div>;
  };

  if (loading || !adminUnit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">Carregando painel da unidade...</p>
        </div>
      </div>
    );
  }

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

        <div className="p-6 border-t border-gray-50">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
             <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Unidade Logada</p>
             <p className="text-sm font-bold text-gray-800 truncate">{adminUnit.name}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={18}/> Sair do Painel
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
         <div className="max-w-5xl mx-auto">
           {renderContent()}
         </div>
      </div>

      {/* Modal de Serviços (Add / Edit) */}
      <ModalWrapper isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title={selectedService ? 'Editar Serviço' : 'Novo Serviço'} size="md">
        <form onSubmit={handleSaveService} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
            <input 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={serviceForm.name} 
              onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
              placeholder="Ex: Consulta Geral, Raio-X..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Especialidade</label>
            <input 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={serviceForm.specialty} 
              onChange={e => setServiceForm({ ...serviceForm, specialty: e.target.value })}
              placeholder="Ex: Clínica Geral, Pediatria..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profissional Responsável</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border bg-white" 
              required
              value={serviceForm.doctor_id} 
              onChange={e => setServiceForm({ ...serviceForm, doctor_id: e.target.value })}
            >
              <option value="" disabled>Selecione um profissional...</option>
              {(adminUnit.doctors || []).map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={serviceForm.description} 
              onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
              placeholder="Descreva o serviço..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Horários</label>
            <input 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={serviceForm.hours} 
              onChange={e => setServiceForm({ ...serviceForm, hours: e.target.value })}
              placeholder="Ex: Seg-Sex 08h às 12h"
            />
          </div>
          <div className="flex justify-end pt-4 border-t gap-2">
            <button type="button" onClick={() => setIsServiceModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 font-medium">Cancelar</button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm text-white font-medium">Salvar</button>
          </div>
        </form>
      </ModalWrapper>

      {/* Modal de Notícias (Add / Edit) */}
      <ModalWrapper isOpen={isNewsModalOpen} onClose={() => setIsNewsModalOpen(false)} title={selectedNews ? 'Editar Comunicado' : 'Novo Comunicado'} size="md">
        <form onSubmit={handleSaveNews} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título do Comunicado</label>
            <input 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={newsForm.title} 
              onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
              placeholder="Ex: Vacinação de Gripe aberta..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Conteúdo do Aviso</label>
            <textarea 
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={newsForm.content} 
              onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
              placeholder="Escreva a mensagem aqui..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Exibida</label>
            <input 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={newsForm.date} 
              onChange={e => setNewsForm({ ...newsForm, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prazo Limite / Expirar Em</label>
            <input 
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={newsForm.expires_at} 
              onChange={e => setNewsForm({ ...newsForm, expires_at: e.target.value })}
            />
          </div>
          <div className="flex justify-end pt-4 border-t gap-2">
            <button type="button" onClick={() => setIsNewsModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 font-medium">Cancelar</button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm text-white font-medium">Publicar</button>
          </div>
        </form>
      </ModalWrapper>

      {/* Modal de Médicos (Add / Edit) */}
      <ModalWrapper isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} title={selectedDoctor ? 'Editar Profissional' : 'Novo Profissional'} size="md">
        <form onSubmit={handleSaveDoctor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Profissional</label>
            <input 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={doctorForm.name} 
              onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })}
              placeholder="Ex: Dr. Fulano de Tal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Especialidade</label>
            <input 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={doctorForm.specialty} 
              onChange={e => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
              placeholder="Ex: Pediatria, Clínica Geral..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CRM / Registro</label>
            <input 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" 
              required
              value={doctorForm.crm} 
              onChange={e => setDoctorForm({ ...doctorForm, crm: e.target.value })}
              placeholder="Ex: CRM-RN 9999"
            />
          </div>
          <div className="flex justify-end pt-4 border-t gap-2">
            <button type="button" onClick={() => setIsDoctorModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 font-medium">Cancelar</button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm text-white font-medium">Salvar</button>
          </div>
        </form>
      </ModalWrapper>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(8px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
};

export default AdminUnitScreen;