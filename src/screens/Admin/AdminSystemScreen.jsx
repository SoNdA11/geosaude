import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Building, History, Plus, Edit2, Trash2, Key, Search, LogOut, Home, LayoutDashboard, ChevronRight, ChevronLeft, FileText, MessageSquare, Activity, Star, RotateCcw } from 'lucide-react';
import ModalAdminEdit from '../../components/ModalAdminEdit';
import ModalUnitEdit from '../../components/ModalUnitEdit';
import ModalConfirmation from '../../components/ModalConfirmation';
import ModalResetPassword from '../../components/ModalResetPassword';
import ModalSuccess from '../../components/ModalSuccess';
import ModalDocumentEdit from '../../components/ModalDocumentEdit';
import ModalWrapper from '../../components/ModalWrapper';
import { api } from '../../utils/api';
import { toast } from '../../utils/toast';
import { getActionTag } from '../../utils/log';

const AdminSystemScreen = ({ units, setSelectedUnit, setView, handleLogout, refreshUnits }) => {
  const [sysSection, setSysSection] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [triageSeverity, setTriageSeverity] = useState('all');
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [isEditDocumentModalOpen, setIsEditDocumentModalOpen] = useState(false);
  const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false);
  const [isDeleteUnitModalOpen, setIsDeleteUnitModalOpen] = useState(false);
  const [isDeleteDocumentModalOpen, setIsDeleteDocumentModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedUnitData, setSelectedUnitData] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  const [adminUsers, setAdminUsers] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filterActionType, setFilterActionType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterUnitId, setFilterUnitId] = useState('');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const unitDropdownRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [documentStatusFilter, setDocumentStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchAdmins = useCallback(async () => {
    try {
      const adminList = await api.getProfiles();
      setAdminUsers(adminList);
    } catch (err) {
      console.error('Erro ao carregar administradores:', err);
    }
  }, []);

  const fetchHistory = useCallback(async (page, actionType = '', startDate = '', endDate = '', unitId = '') => {
    try {
      const res = await api.getHistory(page, ITEMS_PER_PAGE, unitId || null, actionType || null, startDate || null, endDate || null);
      setHistoryData(res.logs || []);
      setTotalPages(res.totalPages || 1);
      setTotalLogs(res.total || 0);
    } catch (err) {
      console.error('Erro ao carregar log de atividades:', err);
    }
  }, []);

  const fetchDocuments = useCallback(async (status = '') => {
    try {
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/documents`;
      if (status) {
        url += `?status=${status}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
    }
  }, []);

  const fetchDashboardData = useCallback(async (severity = 'all') => {
    setLoadingDashboard(true);
    try {
      const data = await api.getAdminDashboard(severity);
      setDashboardData(data);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      toast.error('Erro ao carregar dados do dashboard.');
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const lastLoadedSeverity = useRef(null);

  useEffect(() => {
    if (sysSection === 'dashboard') {
      const hasChangedSeverity = triageSeverity !== lastLoadedSeverity.current;
      const isNotLoaded = !dashboardData;
      if (isNotLoaded || hasChangedSeverity) {
        fetchDashboardData(triageSeverity);
        lastLoadedSeverity.current = triageSeverity;
      }
    }
  }, [sysSection, triageSeverity, fetchDashboardData, dashboardData]);

  useEffect(() => {
    fetchAdmins();
    fetchDocuments('');
  }, [fetchAdmins, fetchDocuments]);

  useEffect(() => {
    fetchHistory(currentPage, filterActionType, filterStartDate, filterEndDate, filterUnitId);
  }, [fetchHistory, currentPage, filterActionType, filterStartDate, filterEndDate, filterUnitId]);

  useEffect(() => {
    if (sysSection === 'documents') {
      fetchDocuments(documentStatusFilter);
    }
  }, [fetchDocuments, sysSection, documentStatusFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setIsUnitDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterActionTypeChange = (val) => { setFilterActionType(val); setCurrentPage(1); };
  const handleFilterStartDateChange = (val) => { setFilterStartDate(val); setCurrentPage(1); };
  const handleFilterEndDateChange = (val) => { setFilterEndDate(val); setCurrentPage(1); };
  const handleFilterUnitIdChange = (val) => { setFilterUnitId(val); setCurrentPage(1); };

  const openEditAdminModal = (admin) => { setSelectedAdmin(admin); setIsEditAdminModalOpen(true); };
  const openEditUnitModal = (unit) => { setSelectedUnitData(unit); setIsEditUnitModalOpen(true); };
  const openEditDocumentModal = (doc) => { setSelectedDocument(doc); setIsEditDocumentModalOpen(true); };
  
  const openDeleteAdminModal = (admin) => { setSelectedAdmin(admin); setIsDeleteAdminModalOpen(true); };
  const openDeleteUnitModal = (unit) => { setSelectedUnitData(unit); setIsDeleteUnitModalOpen(true); };
  const openDeleteDocumentModal = (doc) => { setSelectedDocument(doc); setIsDeleteDocumentModalOpen(true); };
  
  const openResetPasswordModal = (admin) => { setSelectedAdmin(admin); setIsResetPasswordModalOpen(true); };
  
  const handleOperationSuccess = useCallback((operation) => {
    setSuccessTitle('Sucesso');
    setSuccessMessage('Operação realizada com sucesso.');
    setIsSuccessModalOpen(true);
  }, []);

  const handleConfirmDeleteAdmin = async () => {
    try {
      setIsDeleteAdminModalOpen(false);
      await api.deleteProfile(selectedAdmin.id);
      await fetchAdmins();
      setCurrentPage(1);
      await fetchHistory(1);
      handleOperationSuccess('delete_admin');
    } catch (err) {
      toast.error(err.message || 'Erro ao excluir administrador.');
    }
  };

  const handleConfirmDeleteUnit = async () => {
    try {
      setIsDeleteUnitModalOpen(false);
      await api.deleteUnit(selectedUnitData.id);
      await refreshUnits();
      await fetchAdmins();
      setCurrentPage(1);
      await fetchHistory(1);
      handleOperationSuccess('delete_unit');
    } catch (err) {
      toast.error(err.message || 'Erro ao excluir unidade.');
    }
  };

  const handleConfirmDeleteDocument = async () => {
    try {
      setIsDeleteDocumentModalOpen(false);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/documents/${selectedDocument.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        await fetchDocuments(documentStatusFilter);
        setCurrentPage(1);
        await fetchHistory(1);
        handleOperationSuccess('delete_document');
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao excluir documento.');
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao excluir documento.');
    }
  };

  const handleSaveDocument = async (formData) => {
    try {
      let response;
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      if (selectedDocument) {
        response = await fetch(`${baseUrl}/documents/${selectedDocument.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      } else {
        response = await fetch(`${baseUrl}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      }

      if (response.ok) {
        await fetchDocuments(documentStatusFilter);
        setCurrentPage(1);
        await fetchHistory(1);
        handleOperationSuccess(selectedDocument ? 'edit_document' : 'create_document');
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao salvar documento.');
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar documento.');
      throw err;
    }
  };

  const handleSaveAdmin = async (data) => {
    try {
      if (selectedAdmin) {
        await api.updateProfile(selectedAdmin.id, data);
      } else {
        await api.createProfile({
          name: data.name,
          email: data.email,
          password: data.password,
          unitId: data.unitId
        });
      }
      await fetchAdmins();
      setCurrentPage(1);
      await fetchHistory(1);
      handleOperationSuccess('save_admin');
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar administrador.');
    }
  };

  const handleSaveUnit = async (data) => {
    try {
      if (selectedUnitData) {
        await api.updateUnit(selectedUnitData.id, data);
      } else {
        await api.createUnit(data);
      }
      await refreshUnits();
      await fetchAdmins();
      setCurrentPage(1);
      await fetchHistory(1);
      handleOperationSuccess('save_unit');
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar unidade.');
    }
  };

  const handleResetPassword = async (newPassword) => {
    try {
      await api.resetProfilePassword(selectedAdmin.id, newPassword);
      await fetchAdmins();
      setCurrentPage(1);
      await fetchHistory(1);
      handleOperationSuccess('reset_password');
    } catch (err) {
      toast.error(err.message || 'Erro ao resetar senha.');
    }
  };

  const handleOpenCreateModal = () => {
    if (sysSection === 'units') { setSelectedUnitData(null); setIsEditUnitModalOpen(true); } 
    else if (sysSection === 'admins') { setSelectedAdmin(null); setIsEditAdminModalOpen(true); }
    else if (sysSection === 'documents') { setSelectedDocument(null); setIsEditDocumentModalOpen(true); }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Analítico', icon: LayoutDashboard },
    { id: 'units', label: 'Unidades de Saúde', icon: Building },
    { id: 'admins', label: 'Gestores', icon: Users },
    { id: 'documents', label: 'Doc. Informativos', icon: FileText },
    { id: 'history', label: 'Histórico de Logs', icon: History },
  ];

  const DashboardCard = ({ title, count, icon: Icon, active, onClick, colorClass }) => (
    <div 
      onClick={onClick}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between h-20 ${
        active 
          ? `${colorClass} text-white border-transparent shadow-md` 
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col justify-center">
        <span className={`text-2xl font-bold ${active ? 'text-white' : 'text-gray-800'}`}>{count}</span>
        <span className={`text-[11px] font-semibold tracking-wide ${active ? 'text-white/90' : 'text-gray-500'}`}>{title}</span>
      </div>
      <div className={`p-2 rounded-lg ${active ? 'bg-white/10' : 'bg-gray-50'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-450'} />
      </div>
    </div>
  );


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* PAINEL LATERAL (Sidebar) */}
      <div className="w-full md:w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full md:h-screen">
        <div className="p-8 border-b border-gray-50">
           <div className="flex items-center gap-3 text-indigo-700 mb-1">
             <LayoutDashboard size={24} />
             <span className="font-bold text-lg">Gestão Central</span>
           </div>
           <p className="text-xs text-gray-400 pl-9">Painel do Sistema</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setSysSection(item.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-all ${
                sysSection === item.id 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={sysSection === item.id ? 'text-indigo-600' : 'text-gray-400'} />
                {item.label}
              </div>
              {sysSection === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 space-y-3">
          <div className="bg-gray-50 rounded-xl p-4">
             <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Gestor Geral</p>
             <p className="text-sm font-bold text-gray-800 truncate">Secretaria de Saúde</p>
          </div>
          <button 
            onClick={() => setView('home')} 
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 p-3 rounded-xl transition-colors text-sm font-medium border border-gray-100 bg-white"
          >
            <Home size={18}/> Voltar ao Site
          </button>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={18}/> Sair do Painel
          </button>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (Main Content) */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto h-full">
        <div className="max-w-5xl mx-auto">
              {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Painel do Sistema</h1>
               <p className="text-gray-500 mt-1">Gerencie unidades, acessos, documentos oficiais e monitore o histórico.</p>
            </div>
            <div className="flex gap-3">
                {sysSection === 'dashboard' && (
                  <button 
                    onClick={() => fetchDashboardData(triageSeverity)}
                    disabled={loadingDashboard}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <RotateCcw size={18} className={loadingDashboard ? 'animate-spin' : ''} />
                    Atualizar
                  </button>
                )}
               {sysSection !== 'history' && sysSection !== 'dashboard' && (
                  <button 
                     onClick={handleOpenCreateModal}
                     className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm"
                   >
                     <Plus size={18} />
                     {sysSection === 'units' && 'Nova Unidade'}
                     {sysSection === 'admins' && 'Novo Gestor'}
                     {sysSection === 'documents' && 'Novo Documento'}
                   </button>
               )}
            </div>
          </div>
          
          {/* Dashboard Cards */}
          {sysSection !== 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <DashboardCard 
                title="Unidades de Saúde" 
                count={units.length} 
                icon={Building} 
                active={sysSection === 'units'}
                onClick={() => setSysSection('units')}
                colorClass="bg-indigo-600 shadow-indigo-200"
              />
              <DashboardCard 
                title="Gestores" 
                count={adminUsers.length} 
                icon={Users} 
                active={sysSection === 'admins'}
                onClick={() => setSysSection('admins')}
                colorClass="bg-blue-600 shadow-blue-200"
              />
              <DashboardCard 
                title="Documentos" 
                count={documents.length} 
                icon={FileText} 
                active={sysSection === 'documents'}
                onClick={() => setSysSection('documents')}
                colorClass="bg-purple-600 shadow-purple-250"
              />
              <DashboardCard 
                title="Registros de Histórico" 
                count={totalLogs} 
                icon={History} 
                active={sysSection === 'history'}
                onClick={() => setSysSection('history')}
                colorClass="bg-gray-700 shadow-gray-200"
              />
            </div>
          )}

          {sysSection === 'dashboard' ? (
            !dashboardData ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400 text-sm italic">Carregando dados do painel analítico...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {/* Métricas gerais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center justify-between h-20">
                    <div className="truncate">
                      <span className="text-lg font-bold text-gray-800">{dashboardData.totalUnits}</span>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">Unidades de Saúde</span>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                      <Building size={18} />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center justify-between h-20">
                    <div className="truncate">
                      <span className="text-lg font-bold text-gray-800">{dashboardData.totalGestores}</span>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">Gestores</span>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                      <Users size={18} />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center justify-between h-20">
                    <div className="truncate">
                      <span className="text-lg font-bold text-gray-800">{dashboardData.totalDoctors}</span>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">Médicos Cadastrados</span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                      <Users size={18} />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center justify-between h-20">
                    <div className="truncate">
                      <span className="text-lg font-bold text-gray-800">{dashboardData.totalServices}</span>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">Serviços Cadastrados</span>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 shrink-0">
                      <FileText size={18} />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center justify-between h-20">
                    <div className="truncate">
                      <span className="text-lg font-bold text-gray-800">{dashboardData.totalAccesses}</span>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">Total de Acessos</span>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
                      <History size={18} />
                    </div>
                  </div>
                </div>

                {/* Grafico + TOP 5s Primários */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Gráfico de Triagens */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">Quantidade de Triagens realizadas</h3>
                          <p className="text-xs text-gray-400">Distribuição mensal das triagens realizadas</p>
                        </div>
                        {/* Seletor de Gravidade */}
                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: 'all', label: 'Todas', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                            { id: 'blue', label: 'Não urgente', color: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' },
                            { id: 'emerald', label: 'Pouco urgente', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' },
                            { id: 'orange', label: 'Muito urgente', color: 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100' },
                            { id: 'red', label: 'Emergência', color: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' },
                          ].map(pill => (
                            <button
                              key={pill.id}
                              onClick={() => setTriageSeverity(pill.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
                                triageSeverity === pill.id
                                  ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white border-transparent'
                                  : pill.color
                              }`}
                            >
                              {pill.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`transition-opacity duration-200 ${loadingDashboard ? 'opacity-40 pointer-events-none' : ''}`}>
                        {dashboardData.triageChart?.length === 0 ? (
                          <div className="text-center py-10 text-gray-300 italic text-sm">Nenhuma triagem registrada no período.</div>
                        ) : (
                          <div className="w-full">
                          <svg viewBox="0 0 600 220" className="w-full h-auto overflow-visible">
                            <defs>
                              <linearGradient id="triageGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                              const y = 25 + ratio * (220 - 25 - 35);
                              const maxTriageVal = Math.max(...dashboardData.triageChart.map(v => v.value), 5);
                              const val = Math.round(maxTriageVal * (1 - ratio));
                              return (
                                <g key={i} className="opacity-40">
                                  <line 
                                    x1={45} 
                                    y1={y} 
                                    x2={600 - 30} 
                                    y2={y} 
                                    stroke="#f1f5f9" 
                                    strokeWidth={1.5} 
                                  />
                                  <text 
                                    x={35} 
                                    y={y + 4} 
                                    textAnchor="end" 
                                    className="text-[9px] fill-gray-400 font-mono font-medium"
                                  >
                                    {val}
                                  </text>
                                </g>
                              );
                            })}

                            {dashboardData.triageChart.map((d, index) => {
                              const x = 45 + (index * (600 - 45 - 30) / Math.max(dashboardData.triageChart.length - 1, 1));
                              return (
                                <text 
                                  key={index} 
                                  x={x} 
                                  y={220 - 12} 
                                  textAnchor="middle" 
                                  className="text-[9px] fill-gray-400 font-semibold font-mono"
                                >
                                  {d.label}
                                </text>
                              );
                            })}

                            {(() => {
                              const maxTriageVal = Math.max(...dashboardData.triageChart.map(v => v.value), 5);
                              const pts = dashboardData.triageChart.map((d, index) => {
                                const x = 45 + (index * (600 - 45 - 30) / Math.max(dashboardData.triageChart.length - 1, 1));
                                const y = 220 - 35 - (d.value * (220 - 25 - 35) / maxTriageVal);
                                return { x, y, value: d.value };
                              });

                              const lPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                              const aPath = pts.length > 0 
                                ? `${lPath} L ${pts[pts.length - 1].x} ${220 - 35} L ${pts[0].x} ${220 - 35} Z`
                                : '';

                              return (
                                <>
                                  <path d={aPath} fill="url(#triageGradient)" />
                                  <path 
                                    d={lPath} 
                                    fill="none" 
                                    stroke="#4f46e5" 
                                    strokeWidth={2.5} 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                  />
                                  {pts.map((p, i) => (
                                    <g key={i} className="group cursor-pointer">
                                      <circle 
                                        cx={p.x} 
                                        cy={p.y} 
                                        r={4.5} 
                                        fill="#ffffff" 
                                        stroke="#4f46e5" 
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
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>

                  {/* Especialidades e Avaliações */}
                  <div className="flex flex-col gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                          <Activity size={16} className="text-indigo-650" />
                          <h4 className="font-bold text-sm text-gray-800">TOP 5: Especialidades</h4>
                        </div>
                        <div className="space-y-2.5">
                          {dashboardData.topSpecialties?.length > 0 ? (
                            dashboardData.topSpecialties.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 max-w-[70%]">
                                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                                    {index + 1}
                                  </span>
                                  <span className="font-semibold text-gray-700 truncate">{item.specialty}</span>
                                </div>
                                <span className="font-mono text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                  {item.count} serviços
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-gray-400 italic text-xs">Nenhum dado disponível</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                          <Star size={16} className="text-indigo-600" />
                          <h4 className="font-bold text-sm text-gray-805">TOP 5: Unidades (Melhor Avaliação)</h4>
                        </div>
                        <div className="space-y-2.5">
                          {dashboardData.topUnitsByRating?.length > 0 ? (
                            dashboardData.topUnitsByRating.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 max-w-[70%]">
                                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                                    {index + 1}
                                  </span>
                                  <span className="font-semibold text-gray-700 truncate">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-amber-500 text-sm leading-none">★</span>
                                  <span className="font-mono text-gray-600 font-bold">{item.rating.toFixed(2)}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-gray-400 italic text-xs">Nenhum dado disponível</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resto dos TOP 5 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                      <FileText size={16} className="text-indigo-600" />
                      <h4 className="font-bold text-sm text-gray-800">TOP 5: Mais Serviços</h4>
                    </div>
                    <div className="space-y-2.5">
                      {dashboardData.topUnitsByServices?.length > 0 ? (
                        dashboardData.topUnitsByServices.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                                {index + 1}
                              </span>
                              <span className="font-semibold text-gray-700 truncate">{item.name}</span>
                            </div>
                            <span className="font-mono text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                              {item.count} serviços
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-400 italic text-xs">Nenhum dado disponível</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                      <History size={16} className="text-indigo-600" />
                      <h4 className="font-bold text-sm text-gray-805">TOP 5: Mais Acessos</h4>
                    </div>
                    <div className="space-y-2.5">
                      {dashboardData.topUnitsByAccess?.length > 0 ? (
                        dashboardData.topUnitsByAccess.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                                {index + 1}
                              </span>
                              <span className="font-semibold text-gray-700 truncate">{item.name}</span>
                            </div>
                            <span className="font-mono text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                              {item.count} acessos
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-400 italic text-xs">Nenhum dado disponível</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                      <Users size={16} className="text-indigo-600" />
                      <h4 className="font-bold text-sm text-gray-805">TOP 5: Maior Equipe Médica</h4>
                    </div>
                    <div className="space-y-2.5">
                      {dashboardData.topUnitsByDoctors?.length > 0 ? (
                        dashboardData.topUnitsByDoctors.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                                {index + 1}
                              </span>
                              <span className="font-semibold text-gray-700 truncate">{item.name}</span>
                            </div>
                            <span className="font-mono text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                              {item.count} médicos
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-400 italic text-xs">Nenhum dado disponível</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-wrap gap-4">
                <h3 className="font-bold text-lg text-gray-800">
                  {sysSection === 'units' && 'Listagem de Unidades'}
                  {sysSection === 'admins' && 'Gestores de Unidades'}
                  {sysSection === 'documents' && 'Documentos Informativos'}
                  {sysSection === 'history' && 'Log de Atividades'}
                </h3>
                <div className="flex gap-3 items-center flex-wrap">
                  {sysSection === 'documents' && (
                    <select
                      value={documentStatusFilter}
                      onChange={(e) => setDocumentStatusFilter(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="">Todos Status</option>
                      <option value="Rascunho">Rascunhos</option>
                      <option value="Publicado">Publicados</option>
                    </select>
                  )}
                  <div className="relative hidden md:block">
                     <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                     <input className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 transition-all" placeholder="Buscar..."/>
                  </div>
                </div>
              </div>

              {sysSection === 'units' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-4">Nome da Unidade</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Localização</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {units.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">ID: #{u.id}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${u.type === 'Hospital' ? 'bg-purple-50 text-purple-700' : u.type === 'UPA' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {u.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{u.bairro}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setSelectedUnit(u); setView('details'); }} className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Ver Detalhes">
                                      <Search size={18}/>
                                    </button>
                                    <button onClick={() => openEditUnitModal(u)} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar">
                                      <Edit2 size={18}/>
                                    </button>
                                    <button onClick={() => openDeleteUnitModal(u)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                                      <Trash2 size={18}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {sysSection === 'admins' && (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                       <tr>
                         <th className="px-6 py-4">Nome</th>
                         <th className="px-6 py-4">Email</th>
                         <th className="px-6 py-4">Unidade Responsável</th>
                         <th className="px-6 py-4">Último Acesso</th>
                         <th className="px-6 py-4 text-right">Ações</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                       {adminUsers.map(u => (
                         <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {u.name.charAt(0)}
                                 </div>
                                 <span className="font-medium text-sm text-gray-800">{u.name}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                           <td className="px-6 py-4 text-sm text-gray-500">{u.unitName || 'Nenhuma'}</td> 
                           <td className="px-6 py-4 text-sm text-gray-500">
                             {u.lastAccess 
                               ? new Date(u.lastAccess).toLocaleString('pt-BR') 
                               : <span className="text-gray-300 italic">Nunca acessou</span>}
                           </td>
                           <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                               <button onClick={() => openResetPasswordModal(u)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Resetar Senha">
                                   <Key size={18}/>
                               </button>
                               <button onClick={() => openEditAdminModal(u)} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar">
                                   <Edit2 size={18}/>
                               </button>
                               <button onClick={() => openDeleteAdminModal(u)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                                   <Trash2 size={18}/>
                               </button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              )}

              {sysSection === 'documents' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-4">Título</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Órgão Emissor</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Data Publicação</th>
                        <th className="px-6 py-4 text-center">Vis. / Down.</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {documents.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-400 italic">
                            Nenhum documento informativo cadastrado.
                          </td>
                        </tr>
                      ) : (
                        documents.map(doc => (
                          <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-805">
                              <div className="flex flex-col">
                                <span>{doc.titulo}</span>
                                <span className="text-[10px] text-gray-400 font-mono font-normal">
                                  {doc.formato_extensao?.toUpperCase()} • {((doc.tamanho_bytes || 0) / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{doc.categoria}</td>
                            <td className="px-6 py-4 text-gray-500">{doc.orgao_emissor}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                doc.status === 'Publicado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}>
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400">
                              {doc.data_publicacao 
                                ? new Date(doc.data_publicacao).toLocaleString('pt-BR') 
                                : <span className="italic text-gray-300">Rascunho</span>}
                            </td>
                            <td className="px-6 py-4 text-center font-mono text-gray-500 text-xs">
                              <div className="flex items-center justify-center gap-3">
                                <span title="Visualizações">👁️ {doc.contador_visualizacoes}</span>
                                <span title="Downloads">📥 {doc.contador_downloads}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => openEditDocumentModal(doc)}
                                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                                  title="Editar Documento"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteDocumentModal(doc)}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                                  title="Excluir Documento"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {sysSection === 'history' && (
                <div>
                  {/* Filtros de Histórico */}
                  <div className="p-6 border-b border-gray-100 bg-gray-50/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtro por Unidade de Saúde */}
                    <div className="relative" ref={unitDropdownRef}>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unidade de Saúde</label>
                      <button
                        type="button"
                        onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 transition-all cursor-pointer text-left flex justify-between items-center min-h-[34px]"
                      >
                        <span className="truncate mr-1 text-gray-700">
                          {filterUnitId 
                            ? units.find(u => String(u.id) === String(filterUnitId))?.name || 'Unidade não encontrada' 
                            : 'Todas as Unidades'}
                        </span>
                        <span className="text-[9px] text-gray-405">▼</span>
                      </button>

                      {isUnitDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2 font-sans">
                          <input
                            type="text"
                            placeholder="Pesquisar unidade..."
                            value={unitSearchQuery}
                            onChange={(e) => setUnitSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 mb-2 font-medium"
                          />
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleFilterUnitIdChange('');
                                setIsUnitDropdownOpen(false);
                                setUnitSearchQuery('');
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors ${
                                !filterUnitId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
                              }`}
                            >
                              Todas as Unidades
                            </button>
                            {units
                              .filter(u => 
                                u.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
                                  unitSearchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                                )
                              )
                              .map(u => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    handleFilterUnitIdChange(String(u.id));
                                    setIsUnitDropdownOpen(false);
                                    setUnitSearchQuery('');
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors truncate ${
                                    String(filterUnitId) === String(u.id) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
                                  }`}
                                >
                                  {u.name}
                                </button>
                              ))
                            }
                            {units.filter(u => 
                              u.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
                                unitSearchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                              )
                            ).length === 0 && (
                              <div className="text-[10px] text-gray-400 italic text-center py-2">
                                Nenhuma unidade encontrada
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filtro por Tipo de Ação */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo de Ação</label>
                      <select
                        value={filterActionType}
                        onChange={(e) => handleFilterActionTypeChange(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="">Todas as Ações</option>
                        <option value="criação">Criação</option>
                        <option value="edição">Edição</option>
                        <option value="exclusão">Exclusão</option>
                        <option value="login">Login</option>
                      </select>
                    </div>

                    {/* Filtro por Data Inicial */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Período (De)</label>
                      <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => handleFilterStartDateChange(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      />
                    </div>

                    {/* Filtro por Data Final */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Período (Até)</label>
                      <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => handleFilterEndDateChange(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {historyData.map(h => {
                      const tag = getActionTag(h.action);
                      return (
                        <div key={h.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                <History size={16} />
                             </div>
                             <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                   <p className="text-sm font-medium text-gray-800">{h.action}</p>
                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tag.style}`}>
                                     {tag.label}
                                   </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                                  Realizado por <span className="font-semibold text-gray-600">{h.user}</span> ({h.email || 'sistema'})
                                  {h.unit && h.unit !== 'Geral' && (
                                    <span className="text-gray-700 font-bold italic">
                                      • {h.unit}
                                    </span>
                                  )}
                                </p>
                             </div>
                          </div>
                          <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{new Date(h.date).toLocaleString('pt-BR')}</span>
                        </div>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/30 rounded-b-3xl">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-650 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={16} /> Anterior
                      </button>
                      <span className="text-sm font-medium text-gray-500">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-650 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Próximo <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  
      <ModalAdminEdit isOpen={isEditAdminModalOpen} onClose={() => setIsEditAdminModalOpen(false)} adminData={selectedAdmin} onSave={handleSaveAdmin} units={units} />
      <ModalUnitEdit isOpen={isEditUnitModalOpen} onClose={() => setIsEditUnitModalOpen(false)} unitData={selectedUnitData} onSave={handleSaveUnit} admins={adminUsers} />
      <ModalDocumentEdit isOpen={isEditDocumentModalOpen} onClose={() => setIsEditDocumentModalOpen(false)} docData={selectedDocument} onSave={handleSaveDocument} />
      <ModalConfirmation isOpen={isDeleteAdminModalOpen} onClose={() => setIsDeleteAdminModalOpen(false)} onConfirm={handleConfirmDeleteAdmin} title="Confirmar Exclusão" message={`Deseja excluir o gestor ${selectedAdmin?.name}?`} />
      <ModalConfirmation isOpen={isDeleteUnitModalOpen} onClose={() => setIsDeleteUnitModalOpen(false)} onConfirm={handleConfirmDeleteUnit} title="Confirmar Exclusão" message={`Deseja excluir a unidade ${selectedUnitData?.name}?`} />
      <ModalConfirmation isOpen={isDeleteDocumentModalOpen} onClose={() => setIsDeleteDocumentModalOpen(false)} onConfirm={handleConfirmDeleteDocument} title="Confirmar Exclusão" message={`Deseja excluir o documento ${selectedDocument?.titulo}?`} />
      <ModalResetPassword isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} adminData={selectedAdmin} onSave={handleResetPassword} />
      <ModalSuccess isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title={successTitle} message={successMessage} />
    </div>
  );
};

export default AdminSystemScreen;