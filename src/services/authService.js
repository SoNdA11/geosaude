import { supabase } from '../lib/supabaseClient';

/**
 * Serviço de Autenticação
 * Gerencia login, logout, registro e autenticação de usuários via Supabase Auth + Profiles
 */

// ============================================
// SIGN UP - Registrar novo usuário
// ============================================
export const signUp = async (email, password, name, role = 'user', unitId = null) => {
  try {
    // 1. Criar usuário em Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (authError) throw new Error(`Auth error: ${authError.message}`);

    // 2. Inserir profile em tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          auth_id: authData.user.id, // Relaciona com o ID do Auth 
          email,
          name,
          role,
          unit_id: unitId,
          password: '(hashed by supabase)', // Apenas para referência
          created_at: new Date(),
        },
      ]);

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);

    return {
      success: true,
      user: authData.user,
      message: 'Usuário registrado com sucesso',
    };
  } catch (error) {
    console.error('❌ SignUp error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// SIGN IN - Login de usuário
// ============================================
export const signIn = async (email, password) => {
  try {
    // Autenticar com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(`Auth error: ${authError.message}`);

    // Carregar profile do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);

    return {
      success: true,
      user: authData.user,
      profile,
      message: 'Logado com sucesso',
    };
  } catch (error) {
    console.error('❌ SignIn error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// SIGN OUT - Logout
// ============================================
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Logout error: ${error.message}`);

    return {
      success: true,
      message: 'Desconectado com sucesso',
    };
  } catch (error) {
    console.error('❌ SignOut error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// GET CURRENT USER - Obter usuário logado
// ============================================
export const getCurrentUser = async () => {
  try {
    // Obter session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw new Error(`Session error: ${sessionError.message}`);
    if (!session) {
      return {
        success: false,
        user: null,
        profile: null,
        message: 'Nenhum usuário logado',
      };
    }

    // Carregar profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);

    return {
      success: true,
      user: session.user,
      profile,
    };
  } catch (error) {
    console.error('❌ getCurrentUser error:', error.message);
    return {
      success: false,
      user: null,
      profile: null,
      error: error.message,
    };
  }
};

// ============================================
// UPDATE PROFILE - Atualizar dados do usuário
// ============================================
export const updateProfile = async (userId, data) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('auth_id', userId);

    if (error) throw new Error(`Update error: ${error.message}`);

    // Carregar profile atualizado
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', userId)
      .single();

    if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);

    return {
      success: true,
      profile: updatedProfile,
      message: 'Perfil atualizado com sucesso',
    };
  } catch (error) {
    console.error('❌ updateProfile error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// RESET PASSWORD - Resetar senha
// ============================================
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw new Error(`Reset error: ${error.message}`);

    return {
      success: true,
      message: 'Email de reset enviado. Verifique seu email.',
    };
  } catch (error) {
    console.error('❌ resetPassword error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// UPDATE PASSWORD - Atualizar senha do usuário logado
// ============================================
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error(`Update error: ${error.message}`);

    return {
      success: true,
      message: 'Senha atualizada com sucesso',
    };
  } catch (error) {
    console.error('❌ updatePassword error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// AUTH STATE LISTENER - Ouvir mudanças de autenticação
// ============================================
// ============================================
// AUTH STATE LISTENER - Ouvir mudanças de autenticação
// ============================================
export const onAuthStateChange = (callback) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      try {
        // Carregar profile quando houver session
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        // Se houver erro (ex: perfil não existe), lança para o catch
        if (error) throw new Error(error.message);

        callback({
          event,
          user: session.user,
          profile,
          session,
        });
      } catch (err) {
        console.error('⚠️ Erro silencioso capturado no AuthListener:', err.message);
        // Retorna o callback mesmo com erro para não travar a UI do React
        callback({
          event,
          user: session.user,
          profile: null,
          session,
        });
      }
    } else {
      callback({
        event,
        user: null,
        profile: null,
        session: null,
      });
    }
  });

  return subscription;
};
