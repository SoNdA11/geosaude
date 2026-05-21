import { supabase } from '../lib/supabaseClient';

/**
 * Serviço de Serviços de Saúde
 * CRUD para tabela 'services'
 */

// ============================================
// GET SERVICES BY UNIT ID
// ============================================
export const getServicesByUnitId = async (unitId) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('unit_id', unitId)
      .order('name', { ascending: true });

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('❌ getServicesByUnitId error:', error.message);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

// ============================================
// GET SERVICE BY ID
// ============================================
export const getServiceById = async (serviceId) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (error) throw new Error(`Fetch error: ${error.message}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ getServiceById error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// CREATE SERVICE
// ============================================
export const createService = async (unitId, serviceData) => {
  try {
    const dataWithUnit = {
      ...serviceData,
      unit_id: unitId,
    };

    const { data, error } = await supabase
      .from('services')
      .insert([dataWithUnit])
      .select()
      .single();

    if (error) throw new Error(`Create error: ${error.message}`);

    // Registrar auditoria
    await logAction('CREATE', 'services', data.id, dataWithUnit);

    return {
      success: true,
      data,
      message: 'Serviço criado com sucesso',
    };
  } catch (error) {
    console.error('❌ createService error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// UPDATE SERVICE
// ============================================
export const updateService = async (serviceId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw new Error(`Update error: ${error.message}`);

    // Registrar auditoria
    await logAction('UPDATE', 'services', serviceId, updateData);

    return {
      success: true,
      data,
      message: 'Serviço atualizado com sucesso',
    };
  } catch (error) {
    console.error('❌ updateService error:', error.message);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// ============================================
// DELETE SERVICE
// ============================================
export const deleteService = async (serviceId) => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) throw new Error(`Delete error: ${error.message}`);

    // Registrar auditoria
    await logAction('DELETE', 'services', serviceId, { deleted: true });

    return {
      success: true,
      message: 'Serviço deletado com sucesso',
    };
  } catch (error) {
    console.error('❌ deleteService error:', error.message);
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
  getServicesByUnitId,
  getServiceById,
  createService,
  updateService,
  deleteService,
  logAction,
};
