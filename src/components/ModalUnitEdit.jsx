import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';

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
            alert("Por favor, preencha todos os campos obrigatórios.");
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
                    <div>
                        <label htmlFor="adminId" className="block text-sm font-medium text-gray-700">Admin Responsável</label>
                        <select
                            name="adminId"
                            id="adminId"
                            value={formData.adminId}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border bg-white"
                        >
                            <option value="">Nenhum</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
                            ))}
                        </select>
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
