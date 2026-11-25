const express = require("express");
const router = express.Router();
const { requireEmployee, requireAdmin } = require("../../middleware/authorization.middleware.js");

const {
    getlistBillandtaxcredit,
    postAddOrder,
    putOrderUpdate,
    getlistorders,
    deleteOrders,
    postinvoices
} = require("../../modules/sales-billing/sales-billing.controller.js");


//Orders
router.post("/orders", postAddOrder);
router.get("/orders", getlistorders);
router.put("/orders/:id", putOrderUpdate);
router.delete("/orders/:id", requireEmployee, deleteOrders);

//Invoices
router.post("/invoices/:type", postinvoices);
router.get("/invoices", getlistBillandtaxcredit);

module.exports = router;