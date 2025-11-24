import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';

// Mock data for admins - assuming a structure similar to MOCK_USERS in AdminSystemScreen
const MOCK_ADMINS = [
    { id: 101, name: 'Marcos Nunes', email: 'marcos.nunes@mock.com' },
    { id: 102, name: 'Ana Silva', email: 'ana.silva@mock.com' },
    { id: 103, name: 'Pedro Costa', email: 'pedro.costa@mock.com' },
];

const UNIT_TYPES = ["UBS", "UPA", "Hospital"];

const ModalUnitEdit = ({ isOpen, onClose, unitData, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: UNIT_TYPES[0],
        adminId: MOCK_ADMINS[0].id,
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        if (unitData) {
            setFormData({
                name: unitData.name || '',
                type: unitData.type || UNIT_TYPES[0],
                // Assuming unitData has an adminId or we can derive it. Using a default for now.
                adminId: unitData.adminId || MOCK_ADMINS[0].id, 
                latitude: unitData.latitude || '',
                longitude: unitData.longitude || '',
            });
        }
    }, [unitData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // The task requires the modal to be functional, but not the backend logic.
        // We simulate a successful save.
        console.log('Unit data saved:', formData);
        onSave(formData); // This will trigger the success modal in the parent component
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={unitData ? `Editar Unidade: ${unitData.name}` : 'Adicionar Unidade'} size="md">
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
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border bg-white"
                    >
                        {MOCK_ADMINS.map(admin => (
                            <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input
                            type="text"
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
                            type="text"
                            name="longitude"
                            id="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                        />
                    </div>
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
