import { supabase } from '../lib/supabaseClient';

/**
 * Serviço de Notícias
 * CRUD para tabela 'news'
 */

// ============================================
// GET NEWS BY UNIT ID
// ============================================
export const getNewsByUnitId = async (unitId) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('unit_id', unitId)
      .order('date', { ascending: false });

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('❌ getNewsByUnitId error:', error.message);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

// ============================================
// GET NEWS BY ID
// ============================================
export const getNewsById = async (newsId) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', newsId)
      .single();

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ getNewsById error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// CREATE NEWS
// ============================================
export const createNews = async (unitId, newsData) => {
  try {
    const dataWithUnit = {
      ...newsData,
      unit_id: unitId,
    };

    const { data, error } = await supabase
      .from('news')
      .insert([dataWithUnit])
      .select()
      .single();

    if (error) throw new Error(`Create error: ${error.message}`);

    // Registrar auditoria
    await logAction('CREATE', 'news', data.id, dataWithUnit);

    return {
      success: true,
      data,
      message: 'Notícia criada com sucesso',
    };
  } catch (error) {
    console.error('❌ createNews error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// UPDATE NEWS
// ============================================
export const updateNews = async (newsId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', newsId)
      .select()
      .single();

    if (error) throw new Error(`Update error: ${error.message}`);

    // Registrar auditoria
    await logAction('UPDATE', 'news', newsId, updateData);

    return {
      success: true,
      data,
      message: 'Notícia atualizada com sucesso',
    };
  } catch (error) {
    console.error('❌ updateNews error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// DELETE NEWS
// ============================================
export const deleteNews = async (newsId) => {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId);

    if (error) throw new Error(`Delete error: ${error.message}`);

    // Registrar auditoria
    await logAction('DELETE', 'news', newsId, { deleted: true });

    return {
      success: true,
      message: 'Notícia deletada com sucesso',
    };
  } catch (error) {
    console.error('❌ deleteNews error:', error.message);
    return {
      success: false,
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
  getNewsByUnitId,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  logAction,
};
