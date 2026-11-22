const {
  suppliers,
  purchaseOrders,
  purchaseInvoices,
  expenses
} = require("../../data/data-purchases-expenses.js");
const inventory = require("../../data/data.inventory.js");

const roundTwo = (value) => Number(Number(value).toFixed(2));

const VALID_EXPENSE_CATEGORIES = ["BASIC_SERVICES", "RENT", "NET_SALARY"];

// =====================================================
// SUPPLIERS (Maestro de proveedores)
// =====================================================

// POST /api/supplier
const postAddSupplier = (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!String(name || "").trim()) {
      return res.status(400).json({
        message: "Supplier name is required"
      });
    }

    const exists = suppliers.some(
      (s) => s.name.toLowerCase() === String(name).trim().toLowerCase()
    );
    if (exists) {
      return res.status(409).json({
        message: `Supplier '${String(name).trim()}' already exists`
      });
    }

    const nextId = suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1;

    const newSupplier = {
      id: nextId,
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : null
    };

    suppliers.push(newSupplier);

    return res.status(201).json({
      message: "Supplier created successfully!",
      supplier: newSupplier
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating supplier",
      error: error.message
    });
  }
};

// GET /api/supplier
const getSuppliers = (req, res) => {
  try {
    return res.status(200).json({
      total: suppliers.length,
      suppliers
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving suppliers",
      error: error.message
    });
  }
};

// =====================================================
// PURCHASE ORDERS (Órdenes de compra)
// =====================================================

// POST /api/purchase-orders
const postAddPurchaseOrder = (req, res) => {
  try {
    const {
      supplierId,
      branchId = 1,
      employeeId = 1,
      items,
      expectedDate,
      notes = ""
    } = req.body;

    const numericSupplierId = Number(supplierId);

    if (
      !Number.isInteger(numericSupplierId) ||
      numericSupplierId <= 0 ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid data. supplierId and a non-empty items array are required"
      });
    }

    const supplier = suppliers.find((s) => s.id === numericSupplierId);
    if (!supplier) {
      return res.status(404).json({
        message: `Supplier with ID ${numericSupplierId} not found`
      });
    }

    const formattedItems = items.map((item) => {
      const quantity = Number(item.quantity || 0);
      const unitCost = Number(item.unitCost || 0);
      return {
        inventoryId: item.inventoryId ? Number(item.inventoryId) : null,
        name: String(item.name || "").trim(),
        quantity,
        unitCost: roundTwo(unitCost),
        lineSubtotal: roundTwo(quantity * unitCost)
      };
    });

    const invalidItem = formattedItems.some(
      (i) => !i.name || i.quantity <= 0 || i.unitCost < 0
    );
    if (invalidItem) {
      return res.status(400).json({
        message: "Each item must include a valid name, quantity > 0, and unitCost >= 0"
      });
    }

    const subtotal = roundTwo(
      formattedItems.reduce((acc, item) => acc + item.lineSubtotal, 0)
    );
    const tax = roundTwo(subtotal * 0.13);
    const total = roundTwo(subtotal + tax);

    const nextId =
      purchaseOrders.length > 0 ? Math.max(...purchaseOrders.map((o) => o.id)) + 1 : 1;

    const newOrder = {
      id: nextId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      branchId: Number(branchId),
      employeeId: Number(employeeId),
      status: "PENDING", // PENDING | RECEIVED | CANCELLED
      items: formattedItems,
      subtotal,
      tax,
      total,
      expectedDate: expectedDate || null,
      notes: String(notes).trim(),
      createdAt: new Date()
    };

    purchaseOrders.push(newOrder);

    return res.status(201).json({
      message: "Purchase order created successfully!",
      purchaseOrder: newOrder
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating purchase order",
      error: error.message
    });
  }
};

// GET /api/purchase-orders
const getPurchaseOrders = (req, res) => {
  try {
    const { status } = req.query;
    let filteredOrders = purchaseOrders;

    if (status) {
      const normalizedStatus = String(status).trim().toUpperCase();
      filteredOrders = purchaseOrders.filter((o) => o.status === normalizedStatus);
    }

    return res.status(200).json({
      total: filteredOrders.length,
      purchaseOrders: filteredOrders
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving purchase orders",
      error: error.message
    });
  }
};

// =====================================================
// PURCHASE INVOICES (Facturas de compra + Ingreso a Inventario)
// =====================================================

// POST /api/purchase-invoices
const postAddPurchaseInvoice = (req, res) => {
  try {
    const {
      purchaseOrderId = null,
      supplierId,
      branchId = 1,
      employeeId = 1,
      documentNum,
      paymentTerms = "CASH", // CASH | CREDIT
      issueDate,
      dueDate = null,
      items
    } = req.body;

    const numericSupplierId = Number(supplierId);
    const normalizedTerms = String(paymentTerms).trim().toUpperCase();

    if (
      !Number.isInteger(numericSupplierId) ||
      numericSupplierId <= 0 ||
      !String(documentNum || "").trim() ||
      !["CASH", "CREDIT"].includes(normalizedTerms) ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid data. supplierId, documentNum, paymentTerms (CASH/CREDIT), and items are required"
      });
    }

    const supplier = suppliers.find((s) => s.id === numericSupplierId);
    if (!supplier) {
      return res.status(404).json({
        message: `Supplier with ID ${numericSupplierId} not found`
      });
    }

    const formattedItems = items.map((item) => {
      const quantity = Number(item.quantity || 0);
      const unitCost = Number(item.unitCost || 0);
      return {
        inventoryId: item.inventoryId ? Number(item.inventoryId) : null,
        name: String(item.name || "").trim(),
        quantity,
        unitCost: roundTwo(unitCost),
        lineSubtotal: roundTwo(quantity * unitCost)
      };
    });

    const invalidItem = formattedItems.some(
      (i) => !i.name || i.quantity <= 0 || i.unitCost < 0
    );
    if (invalidItem) {
      return res.status(400).json({
        message: "Each item must include a valid name, quantity > 0, and unitCost >= 0"
      });
    }

    // Update inventory stock (Ingreso a inventario)
    formattedItems.forEach((item) => {
      let existingInventoryItem = null;

      if (item.inventoryId) {
        existingInventoryItem = inventory.find((inv) => inv.id === item.inventoryId);
      }
      if (!existingInventoryItem) {
        existingInventoryItem = inventory.find(
          (inv) => inv.name.toLowerCase() === item.name.toLowerCase()
        );
      }

      if (existingInventoryItem) {
        existingInventoryItem.quantity = Number(existingInventoryItem.quantity) + item.quantity;
      } else {
        const nextInvId =
          inventory.length > 0 ? Math.max(...inventory.map((inv) => inv.id)) + 1 : 1;
        inventory.push({
          id: nextInvId,
          name: item.name,
          quantity: item.quantity
        });
      }
    });

    // If linked to a purchase order, mark it as RECEIVED
    if (purchaseOrderId) {
      const linkedOrder = purchaseOrders.find((o) => o.id === Number(purchaseOrderId));
      if (linkedOrder) {
        linkedOrder.status = "RECEIVED";
      }
    }

    const subtotal = roundTwo(
      formattedItems.reduce((acc, item) => acc + item.lineSubtotal, 0)
    );
    const tax = roundTwo(subtotal * 0.13);
    const total = roundTwo(subtotal + tax);

    const nextId =
      purchaseInvoices.length > 0
        ? Math.max(...purchaseInvoices.map((inv) => inv.id)) + 1
        : 1;

    const newInvoice = {
      id: nextId,
      purchaseOrderId: purchaseOrderId ? Number(purchaseOrderId) : null,
      supplierId: supplier.id,
      supplierName: supplier.name,
      branchId: Number(branchId),
      employeeId: Number(employeeId),
      documentNum: String(documentNum).trim(),
      paymentTerms: normalizedTerms,
      status: "RECORDED",
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      dueDate: normalizedTerms === "CREDIT" ? dueDate : null,
      items: formattedItems,
      subtotal,
      tax,
      total,
      createdAt: new Date()
    };

    purchaseInvoices.push(newInvoice);

    return res.status(201).json({
      message: "Purchase invoice recorded and inventory updated successfully!",
      purchaseInvoice: newInvoice
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error recording purchase invoice",
      error: error.message
    });
  }
};

// =====================================================
// GENERAL EXPENSES (Gastos generales: Servicios básicos, Alquiler, Sueldo neto)
// =====================================================

// POST /api/expenses
const postAddExpense = (req, res) => {
  try {
    const {
      branchId = 1,
      employeeId = 1,
      category, // BASIC_SERVICES | RENT | NET_SALARY
      description,
      amount,
      expenseDate,
      reference = ""
    } = req.body;

    const normalizedCategory = String(category || "").trim().toUpperCase();
    const numericAmount = Number(amount);

    if (!VALID_EXPENSE_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({
        message: `Invalid category. Use one of: ${VALID_EXPENSE_CATEGORIES.join(", ")}`
      });
    }

    if (!String(description || "").trim() || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Valid description and amount > 0 are required"
      });
    }

    const nextId = expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;

    const newExpense = {
      id: nextId,
      branchId: Number(branchId),
      employeeId: Number(employeeId),
      category: normalizedCategory,
      description: String(description).trim(),
      amount: roundTwo(numericAmount),
      reference: String(reference).trim(),
      expenseDate: expenseDate || new Date().toISOString().split("T")[0],
      createdAt: new Date()
    };

    expenses.push(newExpense);

    return res.status(201).json({
      message: "General expense recorded successfully!",
      expense: newExpense
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error recording general expense",
      error: error.message
    });
  }
};

// GET /api/expenses
const getExpenses = (req, res) => {
  try {
    const { category } = req.query;
    let filteredExpenses = expenses;

    if (category) {
      const normalizedCategory = String(category).trim().toUpperCase();
      filteredExpenses = expenses.filter((e) => e.category === normalizedCategory);
    }

    const totalAmount = roundTwo(
      filteredExpenses.reduce((acc, item) => acc + item.amount, 0)
    );

    return res.status(200).json({
      total: filteredExpenses.length,
      totalAmount,
      expenses: filteredExpenses
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving general expenses",
      error: error.message
    });
  }
};

module.exports = {
  postAddSupplier,
  getSuppliers,
  postAddPurchaseOrder,
  getPurchaseOrders,
  postAddPurchaseInvoice,
  postAddExpense,
  getExpenses
};