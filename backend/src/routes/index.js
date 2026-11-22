const express = require("express");
const router = express.Router();

const hrRoutes = require("./modules/hr-routes.js");
const inventoryRoutes = require("./modules/inventory-routes.js");
const cashRegisterRoutes = require("./modules/cash-register-routes.js");
const purchasesExpensesRoutes = require("./modules/purchases-expenses-routes.js");

router.use("/inventory", inventoryRoutes);
router.use("/hr", hrRoutes);
router.use("/cash-register", cashRegisterRoutes);
router.use("/", purchasesExpensesRoutes);

module.exports = router;