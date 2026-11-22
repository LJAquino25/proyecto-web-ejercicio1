const pool = require("../config/config.js");

const roundTwo = (value) => Number(Number(value).toFixed(2));

const getTotalSalesAmount = (salesByMethod) => {
  const methods = [
    Number(salesByMethod?.cash) || 0,
    Number(salesByMethod?.card) || 0,
    Number(salesByMethod?.bitcoinChivo) || 0
  ];
  return roundTwo(methods.reduce((acc, current) => acc + current, 0));
};

const mapRowToShift = (row) => {
  if (!row) return null;

  const openingAmount = roundTwo(row.opening_amount);
  const expectedCash = roundTwo(row.expected_cash);
  const cardSales = roundTwo(row.expected_card);
  const bitcoinChivoSales = roundTwo(row.expected_digital);
  const cashSales = roundTwo(Math.max(0, expectedCash - openingAmount));

  const salesByMethod = {
    cash: cashSales,
    card: cardSales,
    bitcoinChivo: bitcoinChivoSales
  };

  const countedCash =
    row.declared_cash !== null && row.declared_cash !== undefined
      ? roundTwo(row.declared_cash)
      : null;

  const difference =
    countedCash !== null ? roundTwo(countedCash - expectedCash) : null;

  return {
    id: row.id,
    cashRegisterId: row.cash_register_id,
    registerName: row.register_name,
    branch: row.branch_name,
    branchId: row.branch_id,
    cashier: row.cashier_name,
    employeeId: row.employee_id,
    openingAmount,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    status: row.status,
    salesByMethod,
    expectedCash,
    countedCash,
    difference,
    totalSales: getTotalSalesAmount(salesByMethod),
    notes: row.notes || ""
  };
};

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

const getAllCashRegisters = async ({ status = null, branch = null } = {}) => {
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
  return rows.map(mapRowToShift);
};

const getOpenCashRegister = async (branch = null) => {
  const params = [];
  let branchFilter = "";

  if (branch) {
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
  return mapRowToShift(rows[0] || null);
};

const resolveCashRegisterAndEmployee = async ({
  branch = "Main Branch",
  cashier = "Shift Cashier",
  cashRegisterId = null,
  employeeId = null
}) => {
  let registerRow = null;

  if (cashRegisterId) {
    const { rows } = await pool.query(
      `SELECT cr.id, cr.branch_id, b.name AS branch_name
       FROM cash_register cr
       INNER JOIN branch b ON b.id = cr.branch_id
       WHERE cr.id = $1`,
      [Number(cashRegisterId)]
    );
    registerRow = rows[0] || null;
  } else if (branch) {
    const { rows } = await pool.query(
      `SELECT cr.id, cr.branch_id, b.name AS branch_name
       FROM cash_register cr
       INNER JOIN branch b ON b.id = cr.branch_id
       WHERE LOWER(b.name) = $1
       ORDER BY cr.id ASC
       LIMIT 1`,
      [String(branch).trim().toLowerCase()]
    );
    registerRow = rows[0] || null;
  }

  if (!registerRow) {
    const { rows } = await pool.query(
      `SELECT cr.id, cr.branch_id, b.name AS branch_name
       FROM cash_register cr
       INNER JOIN branch b ON b.id = cr.branch_id
       ORDER BY cr.id ASC
       LIMIT 1`
    );
    registerRow = rows[0] || null;
  }

  let resolvedEmployeeId = null;

  if (employeeId) {
    const { rows } = await pool.query(
      `SELECT id FROM employee WHERE id = $1`,
      [Number(employeeId)]
    );
    resolvedEmployeeId = rows[0]?.id || null;
  } else if (cashier) {
    const { rows } = await pool.query(
      `SELECT id FROM employee WHERE LOWER(full_name) = $1 LIMIT 1`,
      [String(cashier).trim().toLowerCase()]
    );
    resolvedEmployeeId = rows[0]?.id || null;
  }

  if (!resolvedEmployeeId) {
    const { rows } = await pool.query(
      `SELECT id FROM employee WHERE is_active = TRUE ORDER BY id ASC LIMIT 1`
    );
    resolvedEmployeeId = rows[0]?.id || null;
  }

  return {
    cashRegisterId: registerRow ? registerRow.id : null,
    employeeId: resolvedEmployeeId
  };
};

const addCashRegister = async (registerData) => {
  const {
    cashRegisterId,
    employeeId,
    openingAmount,
    expectedCash,
    notes = ""
  } = registerData;

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
    [
      cashRegisterId,
      employeeId,
      roundTwo(openingAmount),
      roundTwo(expectedCash),
      String(notes || "").trim()
    ]
  );

  const createdId = rows[0].id;
  const { rows: fullRows } = await pool.query(
    `${BASE_SHIFT_QUERY} WHERE cs.id = $1`,
    [createdId]
  );

  return mapRowToShift(fullRows[0]);
};

const updateCashSessionClose = async ({
  sessionId,
  countedCash,
  declaredCard = null,
  declaredDigital = null,
  notes = ""
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
    [
      sessionId,
      roundTwo(countedCash),
      declaredCard !== null && declaredCard !== undefined
        ? roundTwo(declaredCard)
        : null,
      declaredDigital !== null && declaredDigital !== undefined
        ? roundTwo(declaredDigital)
        : null,
      String(notes || "").trim()
    ]
  );

  const { rows } = await pool.query(
    `${BASE_SHIFT_QUERY} WHERE cs.id = $1`,
    [sessionId]
  );

  return mapRowToShift(rows[0]);
};

const incrementCashSessionSale = async ({ sessionId, methodKey, amount }) => {
  const columnMap = {
    cash: "expected_cash",
    card: "expected_card",
    bitcoinChivo: "expected_digital"
  };

  const targetColumn = columnMap[methodKey];
  if (!targetColumn) {
    throw new Error(`Unsupported payment method key: ${methodKey}`);
  }

  await pool.query(
    `UPDATE cash_session
     SET ${targetColumn} = ROUND((${targetColumn} + $2)::numeric, 2)
     WHERE id = $1`,
    [sessionId, roundTwo(amount)]
  );

  const { rows } = await pool.query(
    `${BASE_SHIFT_QUERY} WHERE cs.id = $1`,
    [sessionId]
  );

  return mapRowToShift(rows[0]);
};

module.exports = {
  getAllCashRegisters,
  getOpenCashRegister,
  resolveCashRegisterAndEmployee,
  addCashRegister,
  updateCashSessionClose,
  incrementCashSessionSale,
  getTotalSalesAmount
};