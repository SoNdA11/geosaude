import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Users, Activity, Star, Clock, LogOut, Plus, Trash2, Edit, ChevronRight, LayoutDashboard, ChevronLeft, MessageSquare } from 'lucide-react';
import { api } from '../../utils/api';
import ModalWrapper from '../../components/ModalWrapper';
import { toast } from '../../utils/toast';
import { getActionTag } from '../../utils/log';

const AdminUnitScreen = ({ user, units, handleLogout, refreshUnits }) => {
  const [adminUnit, setAdminUnit] = useState(null);
  const [section, setSection] = useState('dashboard'); 
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsFilter, setReviewsFilter] = useState('unread');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isReviewDetailsOpen, setIsReviewDetailsOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchHistory = useCallback(async (page, unitId) => {
    if (!unitId) return;
    try {
      const res = await api.getHistory(page, ITEMS_PER_PAGE, unitId);
      setHistoryData(res.logs || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Erro ao carregar log de atividades da unidade:', err);
    }
  }, []);

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
      await fetchHistory(1, data.id);
      setCurrentPage(1);
    } catch (err) {
      console.error('Erro ao buscar dados atualizados da unidade:', err);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [user?.unitId, fetchHistory]);

  const fetchReviews = useCallback(async (statusFilter) => {
    try {
      const res = await api.getReviews(statusFilter === 'all' ? null : statusFilter);
      setReviews(res || []);
    } catch (err) {
      console.error('Erro ao carregar avaliações da unidade:', err);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const data = await api.getGestorDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      toast.error('Erro ao carregar dados do dashboard.');
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    if (section === 'dashboard') {
      fetchDashboardData();
    }
  }, [section, fetchDashboardData]);

  useEffect(() => {
    fetchLatestUnitData(true);
  }, [fetchLatestUnitData]);

  useEffect(() => {
    if (adminUnit?.id && section === 'history') {
      fetchHistory(currentPage, adminUnit.id);
    }
  }, [fetchHistory, currentPage, adminUnit?.id, section]);

  useEffect(() => {
    if (section === 'reviews') {
      fetchReviews(reviewsFilter);
    }
  }, [fetchReviews, section, reviewsFilter]);

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
      toast.success('Informações gerais salvas com sucesso!');
      if (refreshUnits) {
        await refreshUnits();
      }
      await fetchLatestUnitData();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar alterações.');
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
      toast.warning('Todos os campos (Nome, Especialidade, Profissional Responsável, Descrição e Horários) são obrigatórios.');
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
      toast.error(err.message || 'Erro ao salvar serviço.');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este serviço?')) return;
    try {
      await api.deleteService(id);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      toast.error(err.message || 'Erro ao remover serviço.');
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
      toast.warning('Todos os campos (Nome, Especialidade e CRM) são obrigatórios.');
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
      toast.error(err.message || 'Erro ao salvar profissional.');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este médico? Todos os serviços que o referenciam ficarão sem responsável.')) return;
    try {
      await api.deleteDoctor(id);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      toast.error(err.message || 'Erro ao remover profissional.');
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
      toast.warning('Todos os campos (Título, Conteúdo, Data Exibida e Prazo Limite) são obrigatórios.');
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
      toast.error(err.message || 'Erro ao salvar notícia.');
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este aviso?')) return;
    try {
      await api.deleteNews(id);
      await fetchLatestUnitData();
      if (refreshUnits) await refreshUnits();
    } catch (err) {
      toast.error(err.message || 'Erro ao remover notícia.');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Analítico', icon: LayoutDashboard },
    { id: 'info', label: 'Informações Gerais', icon: FileText },
    { id: 'team', label: 'Corpo Clínico', icon: Users },
    { id: 'services', label: 'Serviços Ofertados', icon: Activity },
    { id: 'news', label: 'Notícias e Avisos', icon: Star },
    { id: 'reviews', label: 'Avaliações / Feedbacks', icon: MessageSquare },
    { id: 'history', label: 'Histórico de Logs', icon: Clock },
  ];

  const renderContent = () => {
    if (section === 'dashboard') {
      if (loadingDashboard || !dashboardData) {
        return (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-450 text-sm italic">Carregando dados do painel analítico...</p>
            </div>
          </div>
        );
      }

      const { totalDoctors, totalServices, averageRating, accessesChart } = dashboardData;

      const chartHeight = 220;
      const chartWidth = 600;
      const padding = { top: 25, right: 30, bottom: 35, left: 45 };
      const chartValues = accessesChart || [];
      const maxVal = Math.max(...chartValues.map(v => v.value), 5);
      const points = chartValues.map((d, index) => {
        const x = padding.left + (index * (chartWidth - padding.left - padding.right) / Math.max(chartValues.length - 1, 1));
        const y = chartHeight - padding.bottom - (d.value * (chartHeight - padding.top - padding.bottom) / maxVal);
        return { x, y, label: d.label, value: d.value };
      });

      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const areaPath = points.length > 0 
        ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`
        : '';

      return (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Analítico</h2>
            <p className="text-sm text-gray-400 mt-1">Visão geral do desempenho e acessos da unidade.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-800">{totalDoctors}</span>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total de Médicos</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-800">{totalServices}</span>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Serviços Cadastrados</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Activity size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-gray-800">{averageRating || '0.0'}</span>
                  <span className="text-xs text-amber-500 font-bold">★</span>
                </div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Avaliação Média dos Serviços</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Star size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Quantidade de Acessos</h3>
                <p className="text-xs text-gray-400">Total de visitas ao portal da unidade por mês (último ano)</p>
              </div>
            </div>

            {chartValues.length === 0 ? (
              <div className="text-center py-10 text-gray-300 italic text-sm">Nenhum acesso registrado.</div>
            ) : (
              <div className="w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="accessesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
                    const val = Math.round(maxVal * (1 - ratio));
                    return (
                      <g key={i} className="opacity-45">
                        <line 
                          x1={padding.left} 
                          y1={y} 
                          x2={chartWidth - padding.right} 
                          y2={y} 
                          stroke="#f1f5f9" 
                          strokeWidth={1.5} 
                        />
                        <text 
                          x={padding.left - 10} 
                          y={y + 4} 
                          textAnchor="end" 
                          className="text-[9px] fill-gray-400 font-mono font-medium"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {points.map((p, i) => (
                    <text 
                      key={i} 
                      x={p.x} 
                      y={chartHeight - 12} 
                      textAnchor="middle" 
                      className="text-[9px] fill-gray-400 font-semibold font-mono"
                    >
                      {p.label}
                    </text>
                  ))}

                  <path d={areaPath} fill="url(#accessesGradient)" />

                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />

                  {points.map((p, i) => (
                    <g key={i} className="group cursor-pointer">
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r={4.5} 
                        fill="#ffffff" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        className="transition-all duration-200 hover:r-6"
                      />
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 fill-gray-800 text-[10px] font-bold font-mono"
                      >
                        {p.value}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>
        </div>
      );
    }

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
              historyData.map(log => {
                const tag = getActionTag(log.action);
                return (
                  <div key={log.id} className="py-4 flex justify-between items-start gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800">{log.action}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tag.style}`}>
                          {tag.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Realizado por: <span className="font-medium text-gray-600">{log.user}</span></p>
                    </div>
                    <span className="text-[11px] font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded shrink-0">
                      {new Date(log.date).toLocaleString('pt-BR')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-sm font-medium text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Próximo <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      );
    }

    if (section === 'reviews') {
      return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 font-sans">Avaliações dos Serviços</h2>
              <p className="text-xs text-gray-400 mt-1">Acompanhe a opinião dos cidadãos sobre os serviços prestados nesta unidade.</p>
            </div>
            <select
              value={reviewsFilter}
              onChange={(e) => setReviewsFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="unread">Apenas Não Lidas</option>
              <option value="read">Apenas Lidas</option>
              <option value="all">Todas as Avaliações</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Serviço</th>
                  <th className="px-6 py-4">Nota</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 italic">
                      Nenhum feedback encontrado nesta categoria.
                    </td>
                  </tr>
                ) : (
                  reviews.map(rev => (
                    <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {rev.serviceName || 'Geral'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg leading-none ${
                                star <= rev.nota ? 'text-amber-400' : 'text-gray-255'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-xs font-bold text-gray-500 ml-1">({rev.nota})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(rev.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          rev.lido_pelo_gestor
                            ? 'bg-gray-100 text-gray-600 border-gray-200'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {rev.lido_pelo_gestor ? 'Lido' : 'Não Lido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedReview(rev);
                              setIsReviewDetailsOpen(true);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95 border border-blue-100"
                          >
                            Detalhar
                          </button>
                          {!rev.lido_pelo_gestor && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.readReview(rev.id);
                                  toast.success('Feedback marcado como lido!');
                                  fetchReviews(reviewsFilter);
                                } catch (err) {
                                  toast.error(err.message || 'Erro ao marcar feedback como lido.');
                                }
                              }}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95 border border-emerald-100"
                            >
                              Marcar como Lido
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans overflow-hidden">
      <div className="w-full md:w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full md:h-screen">
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
             <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Unidade Logada</p>
             <p className="text-sm font-bold text-gray-800 truncate">{adminUnit.name}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={18}/> Sair do Painel
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto h-full">
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

      <ModalWrapper
        isOpen={isReviewDetailsOpen}
        onClose={() => setIsReviewDetailsOpen(false)}
        title="Detalhes da Avaliação"
        size="md"
      >
        {selectedReview && (
          <div className="space-y-4 font-sans text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Serviço</span>
                <span className="text-sm font-semibold text-gray-800">{selectedReview.serviceName || 'Geral'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Unidade de Saúde</span>
                <span className="text-sm font-semibold text-gray-800">{selectedReview.unitName || 'Não especificada'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nota</span>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg leading-none ${
                        star <= selectedReview.nota ? 'text-amber-400' : 'text-gray-250'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-xs font-bold text-gray-500 ml-1">({selectedReview.nota})</span>
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Data de Envio</span>
                <span className="text-sm text-gray-700 font-medium">{new Date(selectedReview.created_at).toLocaleString('pt-BR')}</span>
              </div>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
              <span className={`inline-block text-xs font-bold px-2.5 py-0.5 mt-1 rounded-full border ${
                selectedReview.lido_pelo_gestor
                  ? 'bg-gray-100 text-gray-600 border-gray-200'
                  : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {selectedReview.lido_pelo_gestor ? 'Lido' : 'Não Lido'}
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Comentário / Relato</span>
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 border border-gray-150 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedReview.comentario || <span className="italic text-gray-400">Sem comentário enviado pelo cidadão.</span>}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t gap-2">
              {!selectedReview.lido_pelo_gestor && (
                <button
                  onClick={async () => {
                    try {
                      await api.readReview(selectedReview.id);
                      toast.success('Feedback marcado como lido!');
                      setIsReviewDetailsOpen(false);
                      fetchReviews(reviewsFilter);
                    } catch (err) {
                      toast.error(err.message || 'Erro ao marcar feedback como lido.');
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-md transition-all active:scale-95"
                >
                  Marcar como Lido
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsReviewDetailsOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm text-gray-700 font-semibold transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
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