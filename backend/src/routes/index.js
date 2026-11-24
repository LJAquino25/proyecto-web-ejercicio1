const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/jwt.middleware.js")

const hrRoutes = require("./modules/hr-routes.js");
const inventoryRoutes = require("./modules/inventory-routes.js");
const cashRegisterRoutes = require("./modules/cash-register-routes.js");
const purchasesExpensesRoutes = require("./modules/purchases-expenses-routes.js");
const salesBillingRoutes = require("./modules/sales-billing-routes.js");
const loginRegisterRoutes = require("./modules/login-register-routes.js")

router.use("/inventory", verifyToken, inventoryRoutes);
router.use("/hr", verifyToken, hrRoutes);
router.use("/cash", verifyToken, cashRegisterRoutes);
router.use("/purchases", verifyToken, purchasesExpensesRoutes);
router.use("/sales", verifyToken, salesBillingRoutes);
router.use("/", loginRegisterRoutes)

module.exports = router;