const pool = require("../../config/config.js");

// =====================================================
// SUPPLIERS
// =====================================================
const findSupplierByName = async (name, db = pool) => {
  const result = await db.query(
    "SELECT id, name, phone FROM supplier WHERE LOWER(name) = LOWER($1)",
    [name]
  );
  return result.rows[0] || null;
};

const findSupplierById = async (id, db = pool) => {
  const result = await db.query(
    "SELECT id, name, phone FROM supplier WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
};

const createSupplier = async ({ name, phone }, db = pool) => {
  const result = await db.query(
    "INSERT INTO supplier (name, phone) VALUES ($1, $2) RETURNING id, name, phone",
    [name, phone]
  );
  return result.rows[0];
};

const getAllSuppliers = async (db = pool) => {
  const result = await db.query(
    "SELECT id, name, phone FROM supplier ORDER BY id ASC"
  );
  return result.rows;
};

// =====================================================
// SUPPLIES & INVENTORY HELPERS
// =====================================================
const findSupplyByName = async (name, db = pool) => {
  const result = await db.query(
    "SELECT id, supplier_id, name, unit FROM supply WHERE LOWER(name) = LOWER($1)",
    [name]
  );
  return result.rows[0] || null;
};

const createSupply = async ({ supplierId, name, unit = "UNIT" }, db = pool) => {
  const result = await db.query(
    "INSERT INTO supply (supplier_id, name, unit) VALUES ($1, $2, $3) RETURNING id, supplier_id, name, unit",
    [supplierId, name, unit]
  );
  return result.rows[0];
};

const upsertBranchSupplyInventory = async (
  { branchId, supplyId, quantity, minStock = 10 },
  db = pool
) => {
  const result = await db.query(
    `INSERT INTO branch_supply_inventory (branch_id, supply_id, quantity, min_stock)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (branch_id, supply_id)
     DO UPDATE SET quantity = branch_supply_inventory.quantity + EXCLUDED.quantity
     RETURNING *`,
    [branchId, supplyId, quantity, minStock]
  );
  return result.rows[0];
};

const upsertBranchPackagedInventory = async (
  { branchId, productId, stock, minStock = 5 },
  db = pool
) => {
  const result = await db.query(
    `INSERT INTO branch_packaged_inventory (branch_id, product_id, stock, min_stock)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (branch_id, product_id)
     DO UPDATE SET stock = branch_packaged_inventory.stock + EXCLUDED.stock
     RETURNING *`,
    [branchId, productId, stock, minStock]
  );
  return result.rows[0];
};

const createInventoryMovement = async (
  { branchId, employeeId, supplyId = null, productId = null, movementType = "IN", quantity },
  db = pool
) => {
  const result = await db.query(
    `INSERT INTO inventory_movement (branch_id, employee_id, supply_id, product_id, movement_type, quantity)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [branchId, employeeId, supplyId, productId, movementType, quantity]
  );
  return result.rows[0];
};

// =====================================================
// PURCHASES (ORDERS & INVOICES)
// =====================================================
const createPurchase = async (
  {
    branchId,
    supplierId,
    employeeId,
    documentNum,
    paymentTerms,
    status = "RECORDED",
    issueDate,
    dueDate,
    subtotal,
    tax,
    total
  },
  db = pool
) => {
  const result = await db.query(
    `INSERT INTO purchase (
      branch_id, supplier_id, employee_id, document_num,
      payment_terms, status, issue_date, due_date, subtotal, tax, total
    )
    VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE), $8, $9, $10, $11)
    RETURNING *`,
    [
      branchId,
      supplierId,
      employeeId,
      documentNum,
      paymentTerms,
      status,
      issueDate,
      dueDate,
      subtotal,
      tax,
      total
    ]
  );
  return result.rows[0];
};

const createPurchaseDetail = async (
  {
    purchaseId,
    supplyId = null,
    packagedProductId = null,
    quantity,
    unitCost,
    lineSubtotal
  },
  db = pool
) => {
  const result = await db.query(
    `INSERT INTO purchase_detail (
      purchase_id, supply_id, packaged_product_id, quantity, unit_cost, line_subtotal
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [purchaseId, supplyId, packagedProductId, quantity, unitCost, lineSubtotal]
  );
  return result.rows[0];
};

const updatePurchaseOrderToInvoice = async (
  { purchaseOrderId, documentNum, paymentTerms, issueDate, dueDate, subtotal, tax, total },
  db = pool
) => {
  const result = await db.query(
    `UPDATE purchase
     SET document_num = $1,
         payment_terms = $2,
         issue_date = COALESCE($3, CURRENT_DATE),
         due_date = $4,
         subtotal = $5,
         tax = $6,
         total = $7
     WHERE id = $8
     RETURNING *`,
    [documentNum, paymentTerms, issueDate, dueDate, subtotal, tax, total, purchaseOrderId]
  );
  return result.rows[0] || null;
};

const deletePurchaseDetailsByPurchaseId = async (purchaseId, db = pool) => {
  await db.query("DELETE FROM purchase_detail WHERE purchase_id = $1", [purchaseId]);
};

const getPurchaseOrders = async (db = pool) => {
  const result = await db.query(`
    SELECT
      p.id,
      p.branch_id,
      p.supplier_id,
      s.name AS supplier_name,
      p.employee_id,
      p.document_num,
      p.payment_terms,
      CASE
        WHEN p.document_num LIKE 'ORD-%' THEN 'PENDING'
        ELSE 'RECEIVED'
      END AS order_status,
      p.issue_date,
      p.due_date AS expected_date,
      p.subtotal,
      p.tax,
      p.total,
      COALESCE(
        json_agg(
          json_build_object(
            'detail_id', pd.id,
            'supply_id', pd.supply_id,
            'packaged_product_id', pd.packaged_product_id,
            'item_name', COALESCE(sup.name, prod.name),
            'quantity', pd.quantity,
            'unit_cost', pd.unit_cost,
            'line_subtotal', pd.line_subtotal
          )
        ) FILTER (WHERE pd.id IS NOT NULL),
        '[]'
      ) AS items
    FROM purchase p
    JOIN supplier s ON p.supplier_id = s.id
    LEFT JOIN purchase_detail pd ON p.id = pd.purchase_id
    LEFT JOIN supply sup ON pd.supply_id = sup.id
    LEFT JOIN product prod ON pd.packaged_product_id = prod.id
    WHERE p.status = 'RECORDED'
    GROUP BY p.id, s.name
    ORDER BY p.id DESC
  `);
  return result.rows;
};

const createAccountPayable = async (
  { purchaseId, supplierId, totalAmount, pendingBalance, dueDate },
  db = pool
) => {
  const result = await db.query(
    `INSERT INTO account_payable (
      purchase_id, supplier_id, total_amount, pending_balance, due_date, status
    )
    VALUES ($1, $2, $3, $4, $5, 'PENDING')
    RETURNING *`,
    [purchaseId, supplierId, totalAmount, pendingBalance, dueDate]
  );
  return result.rows[0];
};

// =====================================================
// GENERAL EXPENSES (Persistidos en cash_movement)
// =====================================================
const getOrCreateActiveCashSession = async ({ branchId, employeeId }, db = pool) => {
  const openSession = await db.query(
    `SELECT cs.id
     FROM cash_session cs
     JOIN cash_register cr ON cs.cash_register_id = cr.id
     WHERE cr.branch_id = $1 AND cs.status = 'OPEN'
     ORDER BY cs.id DESC
     LIMIT 1`,
    [branchId]
  );

  if (openSession.rows[0]) {
    return openSession.rows[0].id;
  }

  const registerResult = await db.query(
    `INSERT INTO cash_register (branch_id, name)
     VALUES ($1, 'Caja Principal')
     ON CONFLICT (branch_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [branchId]
  );
  const cashRegisterId = registerResult.rows[0].id;

  const newSession = await db.query(
    `INSERT INTO cash_session (cash_register_id, employee_id, status, opening_amount)
     VALUES ($1, $2, 'OPEN', 0)
     RETURNING id`,
    [cashRegisterId, employeeId]
  );

  return newSession.rows[0].id;
};

const createGeneralExpense = async (
  { branchId, employeeId, category, description, amount, reference },
  db = pool
) => {
  const sessionId = await getOrCreateActiveCashSession({ branchId, employeeId }, db);
  const refSuffix = reference ? ` (Ref: ${reference})` : "";
  const formattedDesc = `[${category}] ${description}${refSuffix}`.slice(0, 200);

  const result = await db.query(
    `INSERT INTO cash_movement (
      cash_session_id, employee_id, movement_type, description, amount
    )
    VALUES ($1, $2, 'OUT', $3, $4)
    RETURNING id, cash_session_id, employee_id, amount, created_at`,
    [sessionId, employeeId, formattedDesc, amount]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    branch_id: branchId,
    employee_id: row.employee_id,
    category,
    description,
    reference: reference || null,
    amount: row.amount,
    created_at: row.created_at
  };
};

const getGeneralExpenses = async ({ category = null }, db = pool) => {
  const params = [];
  let categoryFilter = `AND description ~ '^\\[(BASIC_SERVICES|RENT|NET_SALARY)\\]'`;

  if (category) {
    params.push(`[${category}]%`);
    categoryFilter = `AND description LIKE $1`;
  }

  const result = await db.query(
    `SELECT
      cm.id,
      cr.branch_id,
      cm.employee_id,
      substring(cm.description FROM '^\\[([A-Z_]+)\\]') AS category,
      regexp_replace(cm.description, '^\\[[A-Z_]+\\]\\s*', '') AS description,
      cm.amount,
      cm.created_at
     FROM cash_movement cm
     JOIN cash_session cs ON cm.cash_session_id = cs.id
     JOIN cash_register cr ON cs.cash_register_id = cr.id
     WHERE cm.movement_type = 'OUT'
       ${categoryFilter}
     ORDER BY cm.id DESC`,
    params
  );

  return result.rows;
};

module.exports = {
  findSupplierByName,
  findSupplierById,
  createSupplier,
  getAllSuppliers,
  findSupplyByName,
  createSupply,
  upsertBranchSupplyInventory,
  upsertBranchPackagedInventory,
  createInventoryMovement,
  createPurchase,
  createPurchaseDetail,
  updatePurchaseOrderToInvoice,
  deletePurchaseDetailsByPurchaseId,
  getPurchaseOrders,
  createAccountPayable,
  createGeneralExpense,
  getGeneralExpenses
};