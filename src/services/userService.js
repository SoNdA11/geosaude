import { supabase } from '../lib/supabaseClient';

/**
 * Serviço de Usuários/Profiles
 * CRUD para tabela 'profiles' + gerenciamento de auth users
 */

// ============================================
// GET ALL PROFILES (apenas system_admin)
// ============================================
export const getAllProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('❌ getAllProfiles error:', error.message);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

// ============================================
// GET PROFILE BY ID
// ============================================
export const getProfileById = async (profileId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', profileId)
      .single();

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ getProfileById error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// CREATE PROFILE (via signUp - em authService)
// Usada quando system_admin cria novo admin
// ============================================
export const createProfile = async (userId, profileData) => {
  try {
    const dataWithId = {
      auth_id: userId,
      ...profileData,
      created_at: new Date(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([dataWithId])
      .select()
      .single();

    if (error) throw new Error(`Create error: ${error.message}`);

    // Registrar auditoria
    await logAction('CREATE', 'profiles', userId, profileData);

    return {
      success: true,
      data,
      message: 'Perfil criado com sucesso',
    };
  } catch (error) {
    console.error('❌ createProfile error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfile = async (profileId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('auth_id', profileId)
      .select()
      .single();

    if (error) throw new Error(`Update error: ${error.message}`);

    // Registrar auditoria
    await logAction('UPDATE', 'profiles', profileId, updateData);

    return {
      success: true,
      data,
      message: 'Perfil atualizado com sucesso',
    };
  } catch (error) {
    console.error('❌ updateProfile error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// DELETE PROFILE (apenas system_admin)
// ============================================
export const deleteProfile = async (profileId) => {
  try {
    // 1. Deletar profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('auth_id', profileId);

    if (profileError) throw new Error(`Delete profile error: ${profileError.message}`);

    // 2. Deletar user auth (admin apenas)
    // Nota: Isso requer usar a Supabase Admin API (supabase-js não permite via client)
    // Para isso, você precisa de um endpoint no backend ou usar Supabase Functions

    // Registrar auditoria
    await logAction('DELETE', 'profiles', profileId, { deleted: true });

    return {
      success: true,
      message: 'Perfil e usuário deletados com sucesso',
    };
  } catch (error) {
    console.error('❌ deleteProfile error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// UPDATE USER PASSWORD (admin reseta senha de outro user)
// Requer backend endpoint - não é possível via client
// ============================================
export const resetUserPassword = async (userId, newPassword) => {
  try {
    // NOTA: Isso não é possível fazer via client Supabase
    // Você precisa de um backend endpoint que use Supabase Admin API
    // Para agora, retornar erro informativo

    return {
      success: false,
      error: 'Reset de senha requer endpoint backend. Implemente em Fase 8.',
    };
  } catch (error) {
    console.error('❌ resetUserPassword error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// GET ADMINS (apenas profiles com role admin)
// ============================================
export const getAdmins = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['system_admin', 'unit_admin'])
      .order('name', { ascending: true });

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('❌ getAdmins error:', error.message);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

// ============================================
// LOG ACTION - Registrar auditoria (HELPER)
// ============================================
const logAction = async (action, tableName, recordId, details = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('history')
      .insert([
        {
          user_id: user.id,
          action,
          table_name: tableName,
          record_id: recordId,
          timestamp: new Date(),
          details,
        },
      ])
      .catch(() => {});
  } catch (error) {
    console.warn('⚠️ logAction error:', error.message);
  }
};

export default {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  resetUserPassword,
  getAdmins,
  logAction,
};
