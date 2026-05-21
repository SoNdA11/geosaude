import { supabase } from '../lib/supabaseClient';

/**
 * Serviço de Unidades de Saúde
 * CRUD completo para tabela 'unidades' com operações no Supabase
 */

// ============================================
// GET ALL UNITS
// ============================================
export const getAllUnits = async () => {
  try {
    const { data, error } = await supabase
      .from('unidades')
      .select(`
        *,
        services (*)
      `)
      .order('name', { ascending: true });

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('❌ getAllUnits error:', error.message);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

// ============================================
// GET UNIT BY ID (com services e news aninhados)
// ============================================
export const getUnitById = async (unitId) => {
  try {
    const { data, error } = await supabase
      .from('unidades')
      .select(`
        *,
        services (*),
        news (*)
      `)
      .eq('id', unitId)
      .single();

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ getUnitById error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// CREATE UNIT (apenas system_admin)
// ============================================
export const createUnit = async (unitData) => {
  try {
    // RLS vai bloquear se não for system_admin
    const { data, error } = await supabase
      .from('unidades')
      .insert([unitData])
      .select()
      .single();

    if (error) throw new Error(`Create error: ${error.message}`);

    // Registrar em history (auditoria)
    await logAction('CREATE', 'unidades', data.id, unitData);

    return {
      success: true,
      data,
      message: 'Unidade criada com sucesso',
    };
  } catch (error) {
    console.error('❌ createUnit error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// UPDATE UNIT
// ============================================
export const updateUnit = async (unitId, updateData) => {
  try {
    // RLS vai bloquear se não tiver permissão
    const { data, error } = await supabase
      .from('unidades')
      .update(updateData)
      .eq('id', unitId)
      .select()
      .single();

    if (error) throw new Error(`Update error: ${error.message}`);

    // Registrar em history
    await logAction('UPDATE', 'unidades', unitId, updateData);

    return {
      success: true,
      data,
      message: 'Unidade atualizada com sucesso',
    };
  } catch (error) {
    console.error('❌ updateUnit error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// DELETE UNIT (apenas system_admin)
// ============================================
export const deleteUnit = async (unitId) => {
  try {
    // RLS vai bloquear se não for system_admin
    const { error } = await supabase
      .from('unidades')
      .delete()
      .eq('id', unitId);

    if (error) throw new Error(`Delete error: ${error.message}`);

    // Registrar em history
    await logAction('DELETE', 'unidades', unitId, { deleted: true });

    return {
      success: true,
      message: 'Unidade deletada com sucesso',
    };
  } catch (error) {
    console.error('❌ deleteUnit error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// SEARCH UNITS (com filtros)
// ============================================
export const searchUnits = async (filters = {}) => {
  try {
    let query = supabase
      .from('unidades')
      .select(`
        *,
        services (*)
      `);

    // Aplicar filtros
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.bairro) {
      query = query.ilike('bairro', `%${filters.bairro}%`);
    }
    if (filters.urgency !== undefined) {
      query = query.eq('urgency', filters.urgency);
    }
    if (filters.open24h !== undefined) {
      query = query.eq('open24h', filters.open24h);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw new Error(`Search error: ${error.message}`);

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('❌ searchUnits error:', error.message);
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
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return; // Sem usuario, não registra

    // Inserir em history
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
      .catch((err) => {
        console.warn('⚠️ Não foi possível registrar auditoria:', err.message);
      });
  } catch (error) {
    console.warn('⚠️ logAction error:', error.message);
  }
};

export default {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  searchUnits,
  logAction,
};
