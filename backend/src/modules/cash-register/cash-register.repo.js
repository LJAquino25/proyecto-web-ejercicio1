const pool = require("../../config/config.js");

const BASE_SHIFT_QUERY = `
  SELECT
    cs.id,
    cs.cash_register_id,
    cr.name AS register_name,
    cr.branch_id,
    b.name AS branch_name,
    cs.employee_id,
    e.full_name AS cashier_name,
    cs.status,
    cs.opened_at,
    cs.closed_at,
    cs.opening_amount,
    cs.expected_cash,
    cs.expected_card,
    cs.expected_digital,
    cs.declared_cash,
    cs.declared_card,
    cs.declared_digital,
    cs.notes
  FROM cash_session cs
  INNER JOIN cash_register cr ON cr.id = cs.cash_register_id
  INNER JOIN branch b ON b.id = cr.branch_id
  INNER JOIN employee e ON e.id = cs.employee_id
`;

const findCashSessions = async ({ status = null, branch = null } = {}) => {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(String(status).trim().toUpperCase());
    conditions.push(`cs.status = $${params.length}`);
  }

  if (branch) {
    params.push(String(branch).trim().toLowerCase());
    conditions.push(`LOWER(b.name) = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    ${BASE_SHIFT_QUERY}
    ${whereClause}
    ORDER BY cs.opened_at DESC, cs.id DESC
  `;

  const { rows } = await pool.query(query, params);
  return rows;
};

const findOpenCashSession = async (branch = null, branchId = null) => {
  const params = [];
  let branchFilter = "";

  if (branchId) {
    params.push(Number(branchId));
    branchFilter = `AND cr.branch_id = $${params.length}`;
  } else if (branch) {
    params.push(String(branch).trim().toLowerCase());
    branchFilter = `AND LOWER(b.name) = $${params.length}`;
  }

  const query = `
    ${BASE_SHIFT_QUERY}
    WHERE cs.status = 'OPEN'
    ${branchFilter}
    ORDER BY cs.id DESC
    LIMIT 1
  `;

  const { rows } = await pool.query(query, params);
  return rows[0] || null;
};

const findCashRegisterById = async (cashRegisterId) => {
  const { rows } = await pool.query(
    `SELECT cr.id, cr.branch_id, b.name AS branch_name
     FROM cash_register cr
     INNER JOIN branch b ON b.id = cr.branch_id
     WHERE cr.id = $1`,
    [Number(cashRegisterId)]
  );
  return rows[0] || null;
};

const findCashRegisterByBranchName = async (branch) => {
  const { rows } = await pool.query(
    `SELECT cr.id, cr.branch_id, b.name AS branch_name
     FROM cash_register cr
     INNER JOIN branch b ON b.id = cr.branch_id
     WHERE LOWER(b.name) = $1
     ORDER BY cr.id ASC
     LIMIT 1`,
    [String(branch).trim().toLowerCase()]
  );
  return rows[0] || null;
};

const findFirstCashRegister = async () => {
  const { rows } = await pool.query(
    `SELECT cr.id, cr.branch_id, b.name AS branch_name
     FROM cash_register cr
     INNER JOIN branch b ON b.id = cr.branch_id
     ORDER BY cr.id ASC
     LIMIT 1`
  );
  return rows[0] || null;
};

const findEmployeeById = async (employeeId) => {
  const { rows } = await pool.query(
    `SELECT id, branch_id, role, is_active FROM employee WHERE id = $1`,
    [Number(employeeId)]
  );
  return rows[0] || null;
};

const findCashSessionById = async (sessionId) => {
  const { rows } = await pool.query(
    `${BASE_SHIFT_QUERY} WHERE cs.id = $1`,
    [sessionId]
  );
  return rows[0] || null;
};

const insertCashSession = async ({
  cashRegisterId,
  employeeId,
  openingAmount,
  expectedCash,
  notes
}) => {
  const { rows } = await pool.query(
    `INSERT INTO cash_session (
      cash_register_id,
      employee_id,
      status,
      opening_amount,
      expected_cash,
      expected_card,
      expected_digital,
      notes
    )
    VALUES ($1, $2, 'OPEN', $3, $4, 0, 0, $5)
    RETURNING id`,
    [cashRegisterId, employeeId, openingAmount, expectedCash, notes]
  );

  return findCashSessionById(rows[0].id);
};

const closeCashSessionInDb = async ({
  sessionId,
  countedCash,
  declaredCard,
  declaredDigital,
  notes
}) => {
  await pool.query(
    `UPDATE cash_session
     SET status = 'CLOSED',
         closed_at = NOW(),
         declared_cash = $2,
         declared_card = $3,
         declared_digital = $4,
         notes = $5
     WHERE id = $1`,
    [sessionId, countedCash, declaredCard, declaredDigital, notes]
  );

  return findCashSessionById(sessionId);
};

const incrementCashSessionSaleColumn = async ({
  sessionId,
  targetColumn,
  amount
}) => {
  await pool.query(
    `UPDATE cash_session
     SET ${targetColumn} = ROUND((${targetColumn} + $2)::numeric, 2)
     WHERE id = $1`,
    [sessionId, amount]
  );

  return findCashSessionById(sessionId);
};

module.exports = {
  findCashSessions,
  findOpenCashSession,
  findCashRegisterById,
  findCashRegisterByBranchName,
  findFirstCashRegister,
  findEmployeeById,
  findCashSessionById,
  insertCashSession,
  closeCashSessionInDb,
  incrementCashSessionSaleColumn
};