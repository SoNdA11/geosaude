import React from 'react';
import ModalWrapper from './ModalWrapper';

const ModalSuccess = ({ isOpen, onClose, title, message }) => {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="mt-2 text-lg leading-6 font-medium text-gray-900">{title}</h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                </div>
                <div className="mt-4">
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        onClick={onClose}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default ModalSuccess;
