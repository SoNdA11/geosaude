import React, { useState, useEffect, useCallback } from 'react';
import { Users, Building, History, Plus, Edit2, Trash2, Key, Search, LogOut, Home, LayoutDashboard, ChevronRight } from 'lucide-react';
import ModalAdminEdit from '../../components/ModalAdminEdit';
import ModalUnitEdit from '../../components/ModalUnitEdit';
import ModalConfirmation from '../../components/ModalConfirmation';
import ModalResetPassword from '../../components/ModalResetPassword';
import ModalSuccess from '../../components/ModalSuccess';
import { api } from '../../utils/api';

const AdminSystemScreen = ({ units, setSelectedUnit, setView, handleLogout, refreshUnits }) => {
  const [sysSection, setSysSection] = useState('units');
  
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false);
  const [isDeleteUnitModalOpen, setIsDeleteUnitModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedUnitData, setSelectedUnitData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  const [adminUsers, setAdminUsers] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  const fetchAdminsAndHistory = useCallback(async () => {
    try {
      const adminList = await api.getProfiles();
      setAdminUsers(adminList);
      const historyList = await api.getHistory();
      setHistoryData(historyList);
    } catch (err) {
      console.error('Erro ao carregar administradores e log de atividades:', err);
    }
  }, []);

  useEffect(() => {
    fetchAdminsAndHistory();
  }, [fetchAdminsAndHistory]);

  const openEditAdminModal = (admin) => { setSelectedAdmin(admin); setIsEditAdminModalOpen(true); };
  const openEditUnitModal = (unit) => { setSelectedUnitData(unit); setIsEditUnitModalOpen(true); };
  const openDeleteAdminModal = (admin) => { setSelectedAdmin(admin); setIsDeleteAdminModalOpen(true); };
  const openDeleteUnitModal = (unit) => { setSelectedUnitData(unit); setIsDeleteUnitModalOpen(true); };
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
      await fetchAdminsAndHistory();
      handleOperationSuccess('delete_admin');
    } catch (err) {
      alert(err.message || 'Erro ao excluir administrador.');
    }
  };

  const handleConfirmDeleteUnit = async () => {
    try {
      setIsDeleteUnitModalOpen(false);
      await api.deleteUnit(selectedUnitData.id);
      await refreshUnits();
      await fetchAdminsAndHistory();
      handleOperationSuccess('delete_unit');
    } catch (err) {
      alert(err.message || 'Erro ao excluir unidade.');
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
      await fetchAdminsAndHistory();
      handleOperationSuccess('save_admin');
    } catch (err) {
      alert(err.message || 'Erro ao salvar administrador.');
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
      await fetchAdminsAndHistory();
      handleOperationSuccess('save_unit');
    } catch (err) {
      alert(err.message || 'Erro ao salvar unidade.');
    }
  };

  const handleResetPassword = async (newPassword) => {
    try {
      await api.resetProfilePassword(selectedAdmin.id, newPassword);
      await fetchAdminsAndHistory();
      handleOperationSuccess('reset_password');
    } catch (err) {
      alert(err.message || 'Erro ao resetar senha.');
    }
  };

  const handleOpenCreateModal = () => {
    if (sysSection === 'units') { setSelectedUnitData(null); setIsEditUnitModalOpen(true); } 
    else if (sysSection === 'admins') { setSelectedAdmin(null); setIsEditAdminModalOpen(true); }
  };

  const menuItems = [
    { id: 'units', label: 'Unidades de Saúde', icon: Building },
    { id: 'admins', label: 'Administradores', icon: Users },
    { id: 'history', label: 'Histórico de Logs', icon: History },
  ];

  const DashboardCard = ({ title, count, icon: Icon, active, onClick, colorClass }) => (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
        active 
          ? `${colorClass} text-white border-transparent shadow-lg` 
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <Icon size={24} className={active ? 'text-white/80' : 'text-gray-400'} />
        <span className={`text-3xl font-bold ${active ? 'text-white' : 'text-gray-800'}`}>{count}</span>
      </div>
      <span className={`font-medium ${active ? 'text-white/90' : 'text-gray-500'}`}>{title}</span>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
      
      {/* PAINEL LATERAL (Sidebar) */}
      <div className="w-full md:w-72 bg-white border-r border-gray-200 flex-shrink-0 md:min-h-screen flex flex-col">
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
             <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Administrador</p>
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
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Painel do Sistema</h1>
               <p className="text-gray-500 mt-1">Gerencie unidades, acessos e monitore o histórico.</p>
            </div>
            <div className="flex gap-3">
               {sysSection !== 'history' && (
                  <button 
                     onClick={handleOpenCreateModal}
                     className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm"
                   >
                     <Plus size={18} />
                     {sysSection === 'units' ? 'Nova Unidade' : 'Novo Admin'}
                   </button>
               )}
            </div>
          </div>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <DashboardCard 
              title="Unidades de Saúde" 
              count={units.length} 
              icon={Building} 
              active={sysSection === 'units'}
              onClick={() => setSysSection('units')}
              colorClass="bg-indigo-600 shadow-indigo-200"
            />
            <DashboardCard 
              title="Administradores" 
              count={adminUsers.length} 
              icon={Users} 
              active={sysSection === 'admins'}
              onClick={() => setSysSection('admins')}
              colorClass="bg-blue-600 shadow-blue-200"
            />
            <DashboardCard 
              title="Registros de Histórico" 
              count={historyData.length} 
              icon={History} 
              active={sysSection === 'history'}
              onClick={() => setSysSection('history')}
              colorClass="bg-gray-700 shadow-gray-200"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {sysSection === 'units' && 'Listagem de Unidades'}
                {sysSection === 'admins' && 'Controle de Acesso'}
                {sysSection === 'history' && 'Log de Atividades'}
              </h3>
              <div className="relative hidden md:block">
                 <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                 <input className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 transition-all" placeholder="Buscar..."/>
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

            {sysSection === 'history' && (
                <div className="divide-y divide-gray-50">
                  {historyData.map(h => (
                    <div key={h.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                            <History size={16} />
                         </div>
                         <div>
                            <p className="text-sm font-medium text-gray-800">{h.action}</p>
                            <p className="text-xs text-gray-400">Realizado por <span className="font-semibold text-gray-600">{h.user}</span> ({h.email || 'sistema'})</p>
                         </div>
                      </div>
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{new Date(h.date).toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  
      <ModalAdminEdit isOpen={isEditAdminModalOpen} onClose={() => setIsEditAdminModalOpen(false)} adminData={selectedAdmin} onSave={handleSaveAdmin} units={units} />
      <ModalUnitEdit isOpen={isEditUnitModalOpen} onClose={() => setIsEditUnitModalOpen(false)} unitData={selectedUnitData} onSave={handleSaveUnit} admins={adminUsers} />
      <ModalConfirmation isOpen={isDeleteAdminModalOpen} onClose={() => setIsDeleteAdminModalOpen(false)} onConfirm={handleConfirmDeleteAdmin} title="Confirmar Exclusão" message={`Deseja excluir o administrador ${selectedAdmin?.name}?`} />
      <ModalConfirmation isOpen={isDeleteUnitModalOpen} onClose={() => setIsDeleteUnitModalOpen(false)} onConfirm={handleConfirmDeleteUnit} title="Confirmar Exclusão" message={`Deseja excluir a unidade ${selectedUnitData?.name}?`} />
      <ModalResetPassword isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} adminData={selectedAdmin} onSave={handleResetPassword} />
      <ModalSuccess isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title={successTitle} message={successMessage} />
    </div>
  );
};

export default AdminSystemScreen;