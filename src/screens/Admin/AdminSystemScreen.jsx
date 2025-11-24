import React, { useState, useCallback } from 'react';
import ModalAdminEdit from '../../components/ModalAdminEdit';
import ModalUnitEdit from '../../components/ModalUnitEdit';
import ModalConfirmation from '../../components/ModalConfirmation';
import ModalResetPassword from '../../components/ModalResetPassword';
import ModalSuccess from '../../components/ModalSuccess';
import { MOCK_USERS, MOCK_HISTORY } from '../../data/mockData';

const AdminSystemScreen = ({ units, setSelectedUnit, setView, handleLogout }) => {
  const [sysSection, setSysSection] = useState('units'); // units, admins, history
  
  // State for Modals
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false);
  const [isDeleteUnitModalOpen, setIsDeleteUnitModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // State for data being edited/deleted
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedUnitData, setSelectedUnitData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  // Handlers for Modals
  const openEditAdminModal = (admin) => {
    setSelectedAdmin(admin);
    setIsEditAdminModalOpen(true);
  };

  const openEditUnitModal = (unit) => {
    setSelectedUnitData(unit);
    setIsEditUnitModalOpen(true);
  };

  const openDeleteAdminModal = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteAdminModalOpen(true);
  };

  const openDeleteUnitModal = (unit) => {
    setSelectedUnitData(unit);
    setIsDeleteUnitModalOpen(true);
  };

  const openResetPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setIsResetPasswordModalOpen(true);
  };

  const handleOperationSuccess = useCallback((operation) => {
    let title = '';
    let message = '';
    switch (operation) {
      case 'edit_admin':
        title = 'Edição de Administrador';
        message = 'Os dados do administrador foram atualizados com sucesso.';
        break;
      case 'edit_unit':
        title = 'Edição de Unidade';
        message = 'Os dados da unidade foram atualizados com sucesso.';
        break;
      case 'create_admin':
        title = 'Criação de Administrador';
        message = 'Novo administrador cadastrado com sucesso.';
        break;
      case 'create_unit':
        title = 'Criação de Unidade';
        message = 'Nova unidade cadastrada com sucesso.';
        break;
      case 'delete_admin':
        title = 'Exclusão de Administrador';
        message = 'O administrador foi excluído com sucesso.';
        break;
      case 'delete_unit':
        title = 'Exclusão de Unidade';
        message = 'A unidade foi excluída com sucesso.';
        break;
      case 'reset_password':
        title = 'Reset de Senha';
        message = 'A senha do administrador foi resetada com sucesso.';
        break;
      default:
        title = 'Operação Concluída';
        message = 'A operação foi realizada com sucesso.';
    }
    setSuccessTitle(title);
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  }, []);

  const handleConfirmDeleteAdmin = () => {
    setIsDeleteAdminModalOpen(false);
    // Simular exclusão
    handleOperationSuccess('delete_admin');
  };

  const handleConfirmDeleteUnit = () => {
    setIsDeleteUnitModalOpen(false);
    // Simular exclusão
    handleOperationSuccess('delete_unit');
  };

  const handleSaveAdmin = (data) => {
    // Simular salvamento
    const operation = selectedAdmin ? 'edit_admin' : 'create_admin';
    handleOperationSuccess(operation);
  };

  const handleSaveUnit = (data) => {
    // Simular salvamento
    const operation = selectedUnitData ? 'edit_unit' : 'create_unit';
    handleOperationSuccess(operation);
  };

  const handleResetPassword = () => {
    // Simular reset de senha
    handleOperationSuccess('reset_password');
  };

  const handleOpenCreateModal = () => {
    if (sysSection === 'units') {
      setSelectedUnitData(null); // Clear data for creation
      setIsEditUnitModalOpen(true);
    } else if (sysSection === 'admins') {
      setSelectedAdmin(null); // Clear data for creation
      setIsEditAdminModalOpen(true);
    }
  };

  const getAddButtonText = () => {
    if (sysSection === 'units') return '+ Adicionar Unidade';
    if (sysSection === 'admins') return '+ Adicionar Administrador';
    return null;
  };

  const addButtonText = getAddButtonText();

  // MOCK_USERS is used in the component, so we need to ensure it's available.
  // The original file imports it, so we can use it.
  const adminUsers = MOCK_USERS.filter(u => u.role === 'unit_admin');

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
          {addButtonText && (
            <div onClick={handleOpenCreateModal} className="bg-emerald-600 text-white p-6 rounded shadow hover:bg-emerald-700 cursor-pointer flex items-center justify-center font-bold">
              {addButtonText}
            </div>
          )}
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
                    <button onClick={() => openEditUnitModal(u)} className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs">Editar</button>
                    <button onClick={() => openDeleteUnitModal(u)} className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs">Excluir</button>
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
                  <tr className="border-b">
                    <th className="pb-2">Nome</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Unidade</th>
                    <th className="pb-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(u => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2">{u.name}</td>
                      <td className="py-2">{u.email}</td>
                      <td className="py-2">UBS Centro Clínico</td> {/* Mocked Unit */}
                      <td className="py-2 text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => openResetPasswordModal(u)} className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs hover:bg-blue-100">Resetar Senha</button>
                          <button onClick={() => openEditAdminModal(u)} className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs hover:bg-amber-100">Editar</button>
                          <button onClick={() => openDeleteAdminModal(u)} className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs hover:bg-red-100">Excluir</button>
                        </div>
                      </td>
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
  
        {/* Modals */}
        <ModalAdminEdit
          isOpen={isEditAdminModalOpen}
          onClose={() => setIsEditAdminModalOpen(false)}
          adminData={selectedAdmin}
          onSave={handleSaveAdmin}
        />
  
        <ModalUnitEdit
          isOpen={isEditUnitModalOpen}
          onClose={() => setIsEditUnitModalOpen(false)}
          unitData={selectedUnitData}
          onSave={handleSaveUnit}
        />
  
        <ModalConfirmation
          isOpen={isDeleteAdminModalOpen}
          onClose={() => setIsDeleteAdminModalOpen(false)}
          onConfirm={handleConfirmDeleteAdmin}
          title="Confirmar Exclusão de Administrador"
          message={`Tem certeza que deseja excluir o administrador ${selectedAdmin?.name}? Esta ação é irreversível.`}
        />
  
        <ModalConfirmation
          isOpen={isDeleteUnitModalOpen}
          onClose={() => setIsDeleteUnitModalOpen(false)}
          onConfirm={handleConfirmDeleteUnit}
          title="Confirmar Exclusão de Unidade"
          message={`Tem certeza que deseja excluir a unidade ${selectedUnitData?.name}? Esta ação é irreversível.`}
        />
  
        <ModalResetPassword
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
          adminData={selectedAdmin}
          onSave={handleResetPassword}
        />
  
        <ModalSuccess
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title={successTitle}
          message={successMessage}
        />
      </div>
    );
  };

export default AdminSystemScreen;