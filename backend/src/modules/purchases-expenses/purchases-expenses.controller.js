const purchasesExpensesService = require("./purchases-expenses.service.js");

// POST /api/purchases/supplier
const postAddSupplier = async (req, res) => {
  try {
    const supplier = await purchasesExpensesService.addSupplier({
      name: req.body.name,
      phone: req.body.phone
    });

    return res.status(201).json({
      message: "Supplier created successfully!",
      supplier
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error creating supplier"
    });
  }
};

// GET /api/purchases/supplier
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await purchasesExpensesService.listSuppliers();
    return res.status(200).json({
      total: suppliers.length,
      suppliers
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error retrieving suppliers"
    });
  }
};

// POST /api/purchases/purchase-orders
const postAddPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await purchasesExpensesService.addPurchaseOrder({
      supplierId: req.body.supplierId ?? req.body.supplier_id,
      branchId: req.body.branchId ?? req.body.branch_id ?? 1,
      employeeId: req.body.employeeId ?? req.body.employee_id ?? 1,
      items: req.body.items,
      expectedDate: req.body.expectedDate ?? req.body.expected_date ?? null
    });

    return res.status(201).json({
      message: "Purchase order created successfully!",
      purchaseOrder
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error creating purchase order"
    });
  }
};

// GET /api/purchases/purchase-orders
const getPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await purchasesExpensesService.listPurchaseOrders(
      req.query.status
    );
    return res.status(200).json({
      total: purchaseOrders.length,
      purchaseOrders
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error retrieving purchase orders"
    });
  }
};

// POST /api/purchases/purchase-invoices
const postAddPurchaseInvoice = async (req, res) => {
  try {
    const purchaseInvoice = await purchasesExpensesService.addPurchaseInvoice({
      purchaseOrderId: req.body.purchaseOrderId ?? req.body.purchase_order_id ?? null,
      supplierId: req.body.supplierId ?? req.body.supplier_id,
      branchId: req.body.branchId ?? req.body.branch_id ?? 1,
      employeeId: req.body.employeeId ?? req.body.employee_id ?? 1,
      documentNum: req.body.documentNum ?? req.body.document_num,
      paymentTerms: req.body.paymentTerms ?? req.body.payment_terms ?? "CASH",
      issueDate: req.body.issueDate ?? req.body.issue_date ?? null,
      dueDate: req.body.dueDate ?? req.body.due_date ?? null,
      items: req.body.items
    });

    return res.status(201).json({
      message: "Purchase invoice recorded and inventory updated successfully!",
      purchaseInvoice
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error recording purchase invoice"
    });
  }
};

// POST /api/purchases/expenses
const postAddExpense = async (req, res) => {
  try {
    const expense = await purchasesExpensesService.addExpense({
      branchId: req.body.branchId ?? req.body.branch_id ?? 1,
      employeeId: req.body.employeeId ?? req.body.employee_id ?? 1,
      category: req.body.category,
      description: req.body.description,
      amount: req.body.amount,
      reference: req.body.reference ?? null
    });

    return res.status(201).json({
      message: "General expense recorded successfully!",
      expense
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error recording general expense"
    });
  }
};

// GET /api/purchases/expenses
const getExpenses = async (req, res) => {
  try {
    const result = await purchasesExpensesService.listExpenses(req.query.category);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error retrieving general expenses"
    });
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await purchasesExpensesService.editSupplier(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postAddSupplier,
  getSuppliers,
  postAddPurchaseOrder,
  getPurchaseOrders,
  postAddPurchaseInvoice,
  postAddExpense,
  getExpenses,
  updateSupplier
};