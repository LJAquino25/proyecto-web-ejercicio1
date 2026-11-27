const express = require("express");
const router = express.Router();

const {
  postAddSupplier,
  getSuppliers,
  updateSupplier,
  postAddPurchaseOrder,
  getPurchaseOrders,
  postAddPurchaseInvoice,
  postAddExpense,
  getExpenses
} = require("../../modules/purchases-expenses/purchases-expenses.controller.js");

// Suppliers
router.post("/supplier", postAddSupplier);
router.get("/supplier", getSuppliers);
router.put("/supplier/:id", updateSupplier);

// Purchase Orders
router.post("/purchase-orders", postAddPurchaseOrder);
router.get("/purchase-orders", getPurchaseOrders);

// Purchase Invoices
router.post("/purchase-invoices", postAddPurchaseInvoice);

// General Expenses
router.post("/expenses", postAddExpense);
router.get("/expenses", getExpenses);

module.exports = router;