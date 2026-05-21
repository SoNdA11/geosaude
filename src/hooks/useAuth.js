import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook useAuth
 * Fornece acesso ao contexto de autenticação em qualquer componente
 *
 * Uso:
 * const { user, profile, isAuthenticated, signIn, signOut } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};

export default useAuth;
