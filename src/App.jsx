import React, { useState } from 'react';
import { LogOut, MapPin, Lock } from 'lucide-react';

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


export default function App() {
  // Estados de Navegação e Dados Globais
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState(MOCK_UNITS);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = () => {
    const foundUser = MOCK_USERS.find(u => u.email === loginEmail && u.password === loginPass);
    if (foundUser) {
      setUser(foundUser);
      setShowLoginModal(false);
      setLoginError('');
      if (foundUser.role === 'system_admin') {
        setView('admin_system');
      } else if (foundUser.role === 'unit_admin') {
        setView('admin_unit');
      }
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const renderNavbar = () => (
    <div className="bg-emerald-600 text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="bg-white p-1 rounded-full">
          <MapPin className="text-emerald-600" size={20} />
        </div>
        <h1 className="text-lg md:text-xl font-bold tracking-wide">Geosaúde Mossoró</h1>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-sm">{user.name}</span>
          <button onClick={handleLogout} className="bg-emerald-700 p-2 rounded hover:bg-emerald-800">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="font-sans text-gray-800">
      {view !== 'admin_unit' && view !== 'admin_system' && renderNavbar()}

      {view === 'home' && <HomeScreen setView={setView} setShowLoginModal={setShowLoginModal} />}
      
      {view === 'map' && (
        <MapScreen 
          units={units} 
          setSelectedUnit={setSelectedUnit} 
          setView={setView} 
        />
      )}
      
      {view === 'details' && (
        <DetailsScreen 
          selectedUnit={selectedUnit} 
          setView={setView} 
          user={user} 
        />
      )}
      
      {view === 'advanced_search' && (
        <AdvancedSearchScreen 
          units={units} 
          setSelectedUnit={setSelectedUnit} 
          setView={setView} 
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
          setView={setView} 
          handleLogout={handleLogout} 
        />
      )}

      {/* Modal Login Global */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="Acesso Restrito">
        <div className="flex flex-col gap-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-start gap-2">
            <Lock className="text-red-500 shrink-0 mt-1" size={16} />
            <p className="text-xs text-red-700">Esta área é protegida. Certifique-se de que possui autorização antes de acessar.</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
            />
          </div>

          {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}

          <button 
            onClick={handleLogin}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 font-medium"
          >
            Entrar
          </button>
        </div>
      </Modal>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}