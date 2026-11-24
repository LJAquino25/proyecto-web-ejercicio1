const express = require("express");
const router = express.Router();

const hrRoutes = require("./modules/hr-routes.js");
const inventoryRoutes = require("./modules/inventory-routes.js");
const cashRegisterRoutes = require("./modules/cash-register-routes.js");
const purchasesExpensesRoutes = require("./modules/purchases-expenses-routes.js");
const salesBillingRoutes = require("./modules/sales-billing-routes.js");
const loginRegisterRoutes = require("./modules/login-register-routes.js")

router.use("/inventory", inventoryRoutes);
router.use("/hr", hrRoutes);
router.use("/cash", cashRegisterRoutes);
router.use("/purchases", purchasesExpensesRoutes);
router.use("/sales", salesBillingRoutes);
router.use("/", loginRegisterRoutes)

module.exports = router;