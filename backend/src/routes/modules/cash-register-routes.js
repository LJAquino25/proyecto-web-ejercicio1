const express = require("express");
const router = express.Router();
const {
  requireCashier,
  requireEmployee
} = require("../../middleware/authorization.middleware.js");

const {
  openCashRegister,
  closeCashRegister,
  getCashRegisterHistory,
  addShiftSale
} = require("../../modules/cash-register/cash-register.controller.js");

router.post("/open", requireCashier, openCashRegister);
router.post("/close", requireCashier, closeCashRegister);
router.get("/history", requireEmployee, getCashRegisterHistory);
router.post("/sale", requireCashier, addShiftSale);

module.exports = router;