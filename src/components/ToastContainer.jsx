import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 className="text-emerald-600 w-5 h-5 flex-shrink-0" />,
  error: <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />,
  warning: <AlertTriangle className="text-amber-600 w-5 h-5 flex-shrink-0" />,
  info: <Info className="text-blue-600 w-5 h-5 flex-shrink-0" />
};

const styles = {
  success: 'bg-emerald-50 border border-emerald-100 text-emerald-900 shadow-emerald-50/50',
  error: 'bg-red-50 border border-red-100 text-red-900 shadow-red-50/50',
  warning: 'bg-amber-50 border border-amber-100 text-amber-900 shadow-amber-50/50',
  info: 'bg-blue-50 border border-blue-100 text-blue-900 shadow-blue-50/50'
};

export default function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg pointer-events-auto transition-all duration-300 transform animate-slide-in ${styles[t.type]}`}
        >
          {icons[t.type]}
          <div className="flex-1 text-sm font-semibold pr-2 leading-snug">
            {t.message}
          </div>
          <button
            onClick={() => onClose(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-0.5"
            aria-label="Fechar notificação"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <style>{`
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
