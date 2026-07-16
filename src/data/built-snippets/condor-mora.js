const supabase = require('../config/supabase');
const SCHEMA   = 'condor';

// Nightly job: recompute overdue interest for every active installment
// entirely inside PostgreSQL through a stored procedure (RPC).
async function actualizarMora() {
  const { data, error } = await supabase.schema(SCHEMA).rpc('actualizar_mora');
  if (error) throw new Error(error.message);
  console.log('[mora]', JSON.stringify(data));
  return data;
}

module.exports = { actualizarMora };
