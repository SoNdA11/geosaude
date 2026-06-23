import React, { useState, useEffect, useRef } from 'react';
import ModalWrapper from './ModalWrapper';
import { toast } from '../utils/toast';

const ModalAdminEdit = ({ isOpen, onClose, adminData, onSave, units = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        unitId: '',
        password: '',
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (adminData) {
            setFormData({
                name: adminData.name || '',
                email: adminData.email || '',
                unitId: adminData.unitId ? String(adminData.unitId) : '',
                password: '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                unitId: '',
                password: '',
            });
        }
        setIsDropdownOpen(false);
        setSearchQuery('');
    }, [adminData, units, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.unitId || (!adminData && !formData.password.trim())) {
            toast.warning("Por favor, preencha todos os campos obrigatórios (nome, email, senha e unidade vinculada).");
            return;
        }

        // Converte unitId para Number antes de passar para onSave
        const preparedData = {
            ...formData,
            unitId: Number(formData.unitId)
        };
        // Se for edição, removemos a senha para não enviar campo vazio
        if (adminData) {
            delete preparedData.password;
        }
        onSave(preparedData);
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={adminData ? `Editar Gestor: ${adminData.name}` : 'Adicionar Gestor'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    />
                </div>
                {!adminData && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha Inicial</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                )}
                <div className="relative font-sans text-left" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700">Unidade Vinculada</label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer text-left flex justify-between items-center min-h-[38px]"
                    >
                      <span className="truncate text-gray-700">
                        {formData.unitId 
                          ? units.find(u => String(u.id) === String(formData.unitId))?.name || 'Unidade não encontrada' 
                          : 'Selecione uma unidade...'}
                      </span>
                      <span className="text-[10px] text-gray-400">▼</span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2 max-h-56 overflow-hidden">
                        <input
                          type="text"
                          placeholder="Pesquisar unidade..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-250 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 mb-2 font-medium"
                        />
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {units
                            .filter(u => 
                              u.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
                                searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                              )
                            )
                            .map(u => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, unitId: String(u.id) }));
                                  setIsDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors truncate ${
                                  String(formData.unitId) === String(u.id) ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'
                                }`}
                              >
                                {u.name} ({u.type})
                              </button>
                            ))
                          }
                          {units.filter(u => 
                            u.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
                              searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                            )
                          ).length === 0 && (
                            <div className="text-xs text-gray-400 italic text-center py-2">
                              Nenhuma unidade encontrada
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        Salvar
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default ModalAdminEdit;
