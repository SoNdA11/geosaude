import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';

const ModalAdminEdit = ({ isOpen, onClose, adminData, onSave, units = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        unitId: '',
        password: '',
    });

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
    }, [adminData, units, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.unitId || (!adminData && !formData.password.trim())) {
            alert("Por favor, preencha todos os campos obrigatórios (nome, email, senha e unidade vinculada).");
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
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={adminData ? `Editar Admin: ${adminData.name}` : 'Adicionar Administrador'} size="md">
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
                <div>
                    <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">Unidade Vinculada</label>
                    <select
                        name="unitId"
                        id="unitId"
                        value={formData.unitId}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border bg-white"
                    >
                        <option value="" disabled>Selecione uma unidade...</option>
                        {units.map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.name} ({unit.type})</option>
                        ))}
                    </select>
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
