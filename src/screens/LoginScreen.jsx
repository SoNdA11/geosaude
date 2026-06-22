import React, { useState } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const LoginScreen = ({ onLogin, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Credenciais inválidas ou erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50/50 p-6 md:p-10 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 flex flex-col relative animate-fade-in">
        
        {/* Botão de Retorno */}
        <button 
          onClick={() => setView('home')} 
          className="absolute top-6 left-6 text-gray-400 hover:text-emerald-600 transition-colors p-2 hover:bg-gray-50 rounded-full"
          title="Voltar ao site"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-6 mb-8">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-4 shadow-sm">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Área do Gestor</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-xs">
            Acesso exclusivo para administradores da rede de saúde de Mossoró.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
              E-mail Institucional
            </label>
            <input 
              type="email" 
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
              placeholder="ex: nome@saude.mossoro.rn.gov.br"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 tracking-wide"
                placeholder="Sua senha institucional"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-100 hover:shadow-xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            <span>{loading ? 'Entrando...' : 'Acessar Painel'}</span>
            {!loading && <Lock size={16} className="opacity-85" />}
          </button>
        </form>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(15px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
