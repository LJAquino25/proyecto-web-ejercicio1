const express = require("express");
const router = express.Router();

const hrRoutes = require("./modules/hr-routes.js");
const inventoryRoutes = require("./modules/inventory-routes.js");
const cashRegisterRoutes = require("./modules/cash-register-routes.js");

router.use("/inventory", inventoryRoutes);
router.use("/hr", hrRoutes);
router.use("/cash-register", cashRegisterRoutes);

module.exports = router;