import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

// Criar contexto de autenticação
export const AuthContext = createContext();

/**
 * Provider de Autenticação
 * Gerencia o estado de login/logout globalmente na aplicação
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // VERIFICAR SESSÃO EXISTENTE AO MONTAR
  // ============================================
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.user);
          setProfile(result.profile);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // ============================================
  // OUVIR MUDANÇAS DE AUTENTICAÇÃO
  // ============================================
  useEffect(() => {
    const subscription = authService.onAuthStateChange((data) => {
      if (data.user) {
        setUser(data.user);
        setProfile(data.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // ============================================
  // FUNÇÕES DE AUTENTICAÇÃO
  // ============================================

  const handleSignUp = useCallback(async (email, password, name, role = 'user', unitId = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signUp(email, password, name, role, unitId);
      if (!result.success) {
        setError(result.error);
        return result;
      }
      // Após signup, fazer login automático
      const loginResult = await authService.signIn(email, password);
      if (loginResult.success) {
        setUser(loginResult.user);
        setProfile(loginResult.profile);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signIn(email, password);
      if (!result.success) {
        setError(result.error);
        return result;
      }
      setUser(result.user);
      setProfile(result.profile);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
        setProfile(null);
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateProfile = useCallback(async (userId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.updateProfile(userId, data);
      if (result.success) {
        setProfile(result.profile);
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.resetPassword(email);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdatePassword = useCallback(async (newPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.updatePassword(newPassword);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    profile,
    isLoading,
    error,
    isAuthenticated: !!user,
    isSystemAdmin: profile?.role === 'system_admin',
    isUnitAdmin: profile?.role === 'unit_admin',
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
