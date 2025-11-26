import React, { useState } from 'react';
import { LogOut, MapPin, Lock, User } from 'lucide-react';

// Importação dos dados
import { MOCK_UNITS, MOCK_USERS } from './data/mockData';

// Importação dos utilitários
import Modal from './components/Utils/Modal';

// Importação das Telas
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import DetailsScreen from './screens/DetailsScreen';
import AdvancedSearchScreen from './screens/AdvancedSearchScreen';
import AdminUnitScreen from './screens/Admin/AdminUnitScreen';
import AdminSystemScreen from './screens/Admin/AdminSystemScreen';
import TriageScreen from './screens/TriageScreen';


export default function App() {
  const [view, setView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState(MOCK_UNITS);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigateTo = (newView) => {
    setPreviousView(view);
    setView(newView);
  };

  const handleLogin = () => {
    const foundUser = MOCK_USERS.find(u => u.email === loginEmail && u.password === loginPass);
    if (foundUser) {
      setUser(foundUser);
      setShowLoginModal(false);
      setLoginError('');
      if (foundUser.role === 'system_admin') {
        navigateTo('admin_system');
      } else if (foundUser.role === 'unit_admin') {
        navigateTo('admin_unit');
      }
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigateTo('home');
  };

  const renderNavbar = () => (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-opacity-90">
      <div className="w-full px-6 md:px-10">
        <div className="flex justify-between items-center h-16">
          
          <div 
            className="flex items-center gap-3 cursor-pointer group transition-all" 
            onClick={() => navigateTo('home')}
          >
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform duration-300">
              <MapPin className="text-white w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                GeoSaúde
              </h1>
              <span className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">Mossoró</span>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-700 leading-tight">{user.name}</span>
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {user.role === 'system_admin' ? 'Gestor do Sistema' : 'Gestor de Unidade'}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-gray-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50 active:scale-95 flex items-center gap-2 group"
                title="Sair do Sistema"
              >
                <span className="text-sm font-medium group-hover:text-red-500 hidden md:block">Sair</span>
                <LogOut size={20} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="text-sm font-semibold text-gray-500 hover:text-emerald-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all group"
            >
              <Lock size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
              <span>Área do Gestor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans text-gray-600 bg-gray-50/50 min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
      {view !== 'admin_unit' && view !== 'admin_system' && renderNavbar()}

      <div className="animate-fade-in">
        {view === 'home' && <HomeScreen setView={navigateTo} />}
        
        {view === 'map' && (
          <MapScreen 
            units={units} 
            setSelectedUnit={setSelectedUnit} 
            setView={navigateTo} 
          />
        )}
        
        {view === 'details' && (
          <DetailsScreen 
            selectedUnit={selectedUnit} 
            setView={navigateTo} 
            user={user} 
            previousView={previousView}
          />
        )}
        
        {view === 'advanced_search' && (
          <AdvancedSearchScreen 
            units={units} 
            setSelectedUnit={setSelectedUnit} 
            setView={navigateTo} 
          />
        )}

        {/* NOVA TELA DE TRIAGEM */}
        {view === 'triage' && (
          <TriageScreen 
            setView={navigateTo} 
            setSelectedUnit={setSelectedUnit}
          />
        )}

        {view === 'admin_unit' && (
          <AdminUnitScreen 
            user={user} 
            units={units} 
            handleLogout={handleLogout} 
          />
        )}
        
        {view === 'admin_system' && (
          <AdminSystemScreen 
            units={units} 
            setSelectedUnit={setSelectedUnit} 
            setView={navigateTo} 
            handleLogout={handleLogout} 
          />
        )}
      </div>

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="Acesso Administrativo">
        <div className="flex flex-col gap-6 pt-2 px-1 pb-2">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0 mt-0.5">
              <Lock size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Área Restrita</h4>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Painel exclusivo para gestores da Secretaria de Saúde.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 group-focus-within:text-emerald-600 transition-colors">E-mail Institucional</label>
              <input 
                type="email" 
                className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                placeholder="ex: nome@saude.mossoro.rn.gov.br"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 group-focus-within:text-emerald-600 transition-colors">Senha de Acesso</label>
              <input 
                type="password" 
                className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 tracking-widest"
                placeholder="••••••••"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
              />
            </div>
          </div>

          {loginError && (
            <div className="text-red-600 text-xs bg-red-50 border border-red-100 p-3 rounded-lg text-center font-medium animate-pulse">
              {loginError}
            </div>
          )}

          <button 
            onClick={handleLogin}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl hover:bg-black font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-gray-200 hover:shadow-xl flex justify-center items-center gap-2"
          >
            <span>Acessar Painel</span>
            <Lock size={16} className="opacity-50" />
          </button>
        </div>
      </Modal>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(15px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
      `}</style>
    </div>
  );
}