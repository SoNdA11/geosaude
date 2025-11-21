import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, showCloseButton = true, zIndex = 50 }) => {
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4`} style={{ zIndex }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {showCloseButton && (
            <button onClick={onClose} className="text-gray-500 hover:text-red-500">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;