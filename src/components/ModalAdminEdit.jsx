import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';

// Mock data for units - assuming a structure similar to the 'units' prop in AdminSystemScreen
const MOCK_UNITS = [
    { id: 1, name: 'UBS Centro Clínico', type: 'UBS' },
    { id: 2, name: 'UPA Zona Sul', type: 'UPA' },
    { id: 3, name: 'Hospital Municipal', type: 'Hospital' },
];

const ModalAdminEdit = ({ isOpen, onClose, adminData, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        unitId: '',
    });

    useEffect(() => {
        if (adminData) {
            setFormData({
                name: adminData.name || '',
                email: adminData.email || '',
                // Assuming adminData has a unitId or we can derive it. Using a default for now.
                unitId: adminData.unitId || MOCK_UNITS[0].id, 
            });
        }
    }, [adminData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // The task requires the modal to be functional, but not the backend logic.
        // We simulate a successful save.
        console.log('Admin data saved:', formData);
        onSave(formData); // This will trigger the success modal in the parent component
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
                <div>
                    <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">Unidade</label>
                    <select
                        name="unitId"
                        id="unitId"
                        value={formData.unitId}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border bg-white"
                    >
                        {MOCK_UNITS.map(unit => (
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
