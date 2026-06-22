import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';

const ModalResetPassword = ({ isOpen, onClose, adminData, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');

    const isPasswordMatch = newPassword === repeatPassword && newPassword.length > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!isPasswordMatch) {
            setError('As senhas não coincidem.');
            return;
        }

        // The task requires the modal to be functional, but not the backend logic.
        // We simulate a successful save.
        console.log(`Password reset for ${adminData?.name || 'Admin'}`);
        onSave(newPassword); // Envia a nova senha para o callback do componente pai
        onClose();
        setNewPassword('');
        setRepeatPassword('');
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Resetar Senha: ${adminData?.name || ''}`} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Senha</label>
                    <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700">Repetir Senha</label>
                    <input
                        type="password"
                        name="repeatPassword"
                        id="repeatPassword"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    />
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        disabled={!isPasswordMatch}
                        className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isPasswordMatch ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Salvar Senha
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default ModalResetPassword;
