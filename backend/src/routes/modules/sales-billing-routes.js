const express = require("express");
const app = express();

const {
    getlistBillandtaxcredit,
    postAddOrder,
    putOrderUpdate,
    getlistorders,
    deleteOrders,
    postinvoices
} = require("../../modules/sales-billing/sales-billing.controller.js"); 

router.post("/orders", postAddOrder);          
router.get("/orders", getlistorders);        
router.put("/orders/:id", putOrderUpdate);       
router.delete("/orders/:id", deleteOrders);
router.post("/invoices/:type", postinvoices); 
router.get("/invoices", getlistBillandtaxcredit);     

module.exports = router;