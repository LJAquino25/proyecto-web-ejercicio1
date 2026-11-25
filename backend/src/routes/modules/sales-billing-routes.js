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
router.put("/orders", putOrderUpdate);       
router.delete("/orders", deleteOrders);

//Invoices
router.post("/invoices", postinvoices); 
router.get("/invoices", requireEmployee, getlistBillandtaxcredit);     

module.exports = router;