import React from 'react';
import ModalWrapper from './ModalWrapper';

const ModalConfirmation = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-gray-700 mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    {confirmText}
                </button>
            </div>
        </ModalWrapper>
    );
};

export default ModalConfirmation;
