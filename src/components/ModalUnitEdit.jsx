import React, { useState, useEffect, useRef } from 'react';
import ModalWrapper from './ModalWrapper';
import { toast } from '../utils/toast';

const UNIT_TYPES = ["UBS", "UPA", "Hospital"];

const ModalUnitEdit = ({ isOpen, onClose, unitData, onSave, admins = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: UNIT_TYPES[0],
        adminId: '',
        latitude: '',
        longitude: '',
        bairro: '',
        rua: '',
        cep: '',
        phone: '',
        hours: '',
        target: '',
        urgency: false,
        open24h: false
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        setIsDropdownOpen(false);
        setSearchQuery('');
    }, [unitData, admins, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (unitData) {
            setFormData({
                name: unitData.name || '',
                type: unitData.type || UNIT_TYPES[0],
                adminId: unitData.adminId || (admins[0]?.id || ''), 
                latitude: unitData.lat !== undefined ? String(unitData.lat) : '',
                longitude: unitData.lng !== undefined ? String(unitData.lng) : '',
                bairro: unitData.bairro || '',
                rua: unitData.rua || '',
                cep: unitData.cep || '',
                phone: unitData.phone || '',
                hours: unitData.hours || '',
                target: unitData.target || '',
                urgency: !!unitData.urgency,
                open24h: !!unitData.open24h
            });
        } else {
            setFormData({
                name: '',
                type: UNIT_TYPES[0],
                adminId: admins[0]?.id || '',
                latitude: '',
                longitude: '',
                bairro: '',
                rua: '',
                cep: '',
                phone: '',
                hours: '',
                target: '',
                urgency: false,
                open24h: false
            });
        }
    }, [unitData, admins, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.type || !formData.latitude || !formData.longitude || 
            !formData.bairro || !formData.rua || !formData.cep || !formData.phone || 
            !formData.hours || !formData.target) {
            toast.warning("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const preparedData = {
            name: formData.name,
            type: formData.type,
            lat: parseFloat(formData.latitude),
            lng: parseFloat(formData.longitude),
            bairro: formData.bairro,
            rua: formData.rua,
            cep: formData.cep,
            phone: formData.phone,
            hours: formData.hours,
            target: formData.target,
            urgency: formData.urgency,
            open24h: formData.open24h,
            adminId: formData.adminId ? Number(formData.adminId) : null
        };
        onSave(preparedData);
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={unitData ? `Editar Unidade: ${unitData.name}` : 'Adicionar Unidade'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
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
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select
                            name="type"
                            id="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border bg-white"
                        >
                            {UNIT_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700">Gestor Responsável</label>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer text-left flex justify-between items-center min-h-[38px]"
                        >
                          <span className="truncate text-gray-700">
                            {formData.adminId 
                              ? admins.find(a => String(a.id) === String(formData.adminId))?.name || 'Gestor não encontrado' 
                              : 'Nenhum'}
                          </span>
                          <span className="text-[10px] text-gray-400">▼</span>
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2 max-h-56 overflow-hidden">
                            <input
                              type="text"
                              placeholder="Pesquisar gestor..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-250 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 mb-2 font-medium"
                            />
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, adminId: '' }));
                                  setIsDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors ${
                                  !formData.adminId ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'
                                }`}
                              >
                                Nenhum
                              </button>
                              {admins
                                .filter(admin => 
                                  admin.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
                                    searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                                  )
                                )
                                .map(admin => (
                                  <button
                                    key={admin.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, adminId: String(admin.id) }));
                                      setIsDropdownOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors truncate ${
                                      String(formData.adminId) === String(admin.id) ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'
                                    }`}
                                  >
                                    {admin.name} ({admin.email})
                                  </button>
                                ))
                              }
                              {admins.filter(admin => 
                                admin.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
                                  searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                                )
                              ).length === 0 && (
                                <div className="text-xs text-gray-400 italic text-center py-2">
                                  Nenhum gestor encontrado
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input
                            type="number"
                            step="any"
                            name="latitude"
                            id="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input
                            type="number"
                            step="any"
                            name="longitude"
                            id="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro</label>
                        <input
                            type="text"
                            name="bairro"
                            id="bairro"
                            value={formData.bairro}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="rua" className="block text-sm font-medium text-gray-700">Rua (Endereço)</label>
                        <input
                            type="text"
                            name="rua"
                            id="rua"
                            value={formData.rua}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                        <input
                            type="text"
                            name="cep"
                            id="cep"
                            value={formData.cep}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 59600-000"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-700">Público Alvo</label>
                        <input
                            type="text"
                            name="target"
                            id="target"
                            value={formData.target}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Moradores do bairro..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="hours" className="block text-sm font-medium text-gray-700">Horário de Funcionamento</label>
                        <input
                            type="text"
                            name="hours"
                            id="hours"
                            value={formData.hours}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="flex gap-6 py-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            name="urgency"
                            checked={formData.urgency}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        Atendimento Urgente
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            name="open24h"
                            checked={formData.open24h}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        Aberto 24 Horas
                    </label>
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

export default ModalUnitEdit;
