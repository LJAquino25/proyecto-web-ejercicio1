const pool = require("../../config/config.js");

const BASE_ORDER_QUERY = `
  SELECT
    co.id,
    co.branch_id,
    co.customer_id,
    co.employee_id,
    co.invoice_type,
    co.status,
    co.created_at,
    co.subtotal,
    co.tax,
    co.total,
    COALESCE(
      json_agg(
        json_build_object(
          'product_id', od.product_id,
          'product_name', p.name,
          'quantity', od.quantity,
          'unit_price', od.unit_price
        )
      ) FILTER (WHERE od.product_id IS NOT NULL),
      '[]'::json
    ) AS items
  FROM customer_order co
  LEFT JOIN order_detail od ON od.order_id = co.id
  LEFT JOIN product p ON p.id = od.product_id
`;

const getAllOrders = async (db = pool) => {
    const { rows } = await db.query(`
      ${BASE_ORDER_QUERY}
      GROUP BY co.id
      ORDER BY co.id DESC
    `);
    return rows;
};

const getOrderById = async (orderId, db = pool) => {
    const { rows } = await db.query(
        `
      ${BASE_ORDER_QUERY}
      WHERE co.id = $1
      GROUP BY co.id
    `,
        [orderId]
    );
    return rows[0] || null;
};

const findOrderRowById = async (orderId, db = pool) => {
    const { rows } = await db.query(
        `SELECT * FROM customer_order WHERE id = $1`,
        [orderId]
    );
    return rows;
};

const findProductsByIds = async (productIds, db = pool) => {
    const { rows } = await db.query(
        `SELECT id, name, price FROM product WHERE id = ANY($1::int[])`,
        [productIds]
    );
    return rows;
};

const insertOrder = async (
    { branchId, customerId, employeeId, invoiceType, status, subtotal, tax, total },
    db = pool
) => {
    const { rows } = await db.query(
        `INSERT INTO customer_order (
        branch_id, customer_id, employee_id, invoice_type, status, subtotal, tax, total
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
        [branchId, customerId, employeeId, invoiceType, status, subtotal, tax, total]
    );
    return rows[0];
};

const insertOrderDetail = async (
    { orderId, productId, quantity, unitPrice },
    db = pool
) => {
    await db.query(
        `INSERT INTO order_detail (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, productId, quantity, unitPrice]
    );
};

const deleteOrderDetailsByOrderId = async (orderId, db = pool) => {
    await db.query(`DELETE FROM order_detail WHERE order_id = $1`, [orderId]);
};

const getOrderDetailsByOrderId = async (orderId, db = pool) => {
    const { rows } = await db.query(
        `SELECT product_id, quantity, unit_price FROM order_detail WHERE order_id = $1`,
        [orderId]
    );
    return rows;
};

const updateOrder = async (
    {
        orderId,
        branchId,
        customerId,
        employeeId,
        invoiceType,
        status,
        subtotal,
        tax,
        total
    },
    db = pool
) => {
    await db.query(
        `UPDATE customer_order
       SET branch_id = $1,
           customer_id = $2,
           employee_id = $3,
           invoice_type = $4,
           status = $5,
           subtotal = $6,
           tax = $7,
           total = $8
       WHERE id = $9`,
        [
            branchId,
            customerId,
            employeeId,
            invoiceType,
            status,
            subtotal,
            tax,
            total,
            orderId
        ]
    );
};

const deleteOrder = async (orderId, db = pool) => {
    const { rows } = await db.query(
        `DELETE FROM customer_order WHERE id = $1 RETURNING *`,
        [orderId]
    );
    return rows[0] || null;
};


const getOrderDetailsWithProductName = async (orderId, db = pool) => {
    const { rows } = await db.query(
        `SELECT od.product_id, p.name AS product_name, od.quantity, od.unit_price
       FROM order_detail od
       JOIN product p ON p.id = od.product_id
       WHERE od.order_id = $1`,
        [orderId]
    );
    return rows;
};

const updateOrderBilling = async (
    { orderId, invoiceType, subtotal, tax, total, status },
    db = pool
) => {
    const { rows } = await db.query(
        `UPDATE customer_order
       SET invoice_type = $1,
           subtotal = $2,
           tax = $3,
           total = $4,
           status = $5
       WHERE id = $6
       RETURNING *`,
        [invoiceType, subtotal, tax, total, status, orderId]
    );
    return rows[0];
};

const insertInvoice = async (orderId, db = pool) => {
    const { rows } = await db.query(
        `INSERT INTO invoice (order_id) VALUES ($1) RETURNING *`,
        [orderId]
    );
    return rows[0];
};

const insertTaxCreditNote = async (
    { orderId, nit, nrc, institutionName, businessLine, address },
    db = pool
) => {
    const { rows } = await db.query(
        `INSERT INTO tax_credit_note (
          order_id, nit, nrc, institution_name, business_line, address
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [orderId, nit, nrc, institutionName, businessLine, address]
    );
    return rows[0];
};

const insertPayment = async (
    { orderId, cashSessionId, method, gatewayReference, amount },
    db = pool
) => {
    const { rows } = await db.query(
        `INSERT INTO payment (
          order_id, cash_session_id, method, gateway_reference, amount, status
        )
        VALUES ($1, $2, $3, $4, $5, 'APPROVED')
        RETURNING *`,
        [orderId, cashSessionId, method, gatewayReference, amount]
    );
    return rows[0];
};

const getInvoices = async (filterType = null, db = pool) => {
    const normalQuery = `
    SELECT
      'NORMAL' AS document_type,
      i.correlative AS document_number,
      i.issued_at,
      co.id AS order_id,
      co.branch_id,
      co.customer_id,
      co.status AS order_status,
      co.subtotal,
      co.tax,
      co.total,
      NULL::varchar AS nit,
      NULL::varchar AS nrc,
      NULL::varchar AS institution_name
    FROM invoice i
    JOIN customer_order co ON co.id = i.order_id
  `;

    const taxCreditQuery = `
    SELECT
      'TAX_CREDIT' AS document_type,
      tcn.order_id AS document_number,
      co.created_at AS issued_at,
      co.id AS order_id,
      co.branch_id,
      co.customer_id,
      co.status AS order_status,
      co.subtotal,
      co.tax,
      co.total,
      tcn.nit,
      tcn.nrc,
      tcn.institution_name
    FROM tax_credit_note tcn
    JOIN customer_order co ON co.id = tcn.order_id
  `;

    let finalQuery;

    if (filterType === "NORMAL") {
        finalQuery = `${normalQuery} ORDER BY issued_at DESC`;
    } else if (filterType === "TAX_CREDIT") {
        finalQuery = `${taxCreditQuery} ORDER BY issued_at DESC`;
    } else {
        finalQuery = `
      SELECT * FROM (
        ${normalQuery}
        UNION ALL
        ${taxCreditQuery}
      ) docs
      ORDER BY issued_at DESC
    `;
    }

    const { rows } = await db.query(finalQuery);
    return rows;
};

module.exports = {
    getAllOrders,
    getOrderById,
    findOrderRowById,
    findProductsByIds,
    insertOrder,
    insertOrderDetail,
    deleteOrderDetailsByOrderId,
    getOrderDetailsByOrderId,
    updateOrder,
    deleteOrder,
    getOrderDetailsWithProductName,
    updateOrderBilling,
    insertInvoice,
    insertTaxCreditNote,
    insertPayment,
    getInvoices
};
