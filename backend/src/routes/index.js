const express = require("express");
const router = express.Router();

const hrRoutes = require("./modules/hr-routes.js");
const inventoryRoutes = require("./modules/inventory-routes.js");

router.use("/inventory", inventoryRoutes);
router.use("/hr", hrRoutes);

module.exports = router;
