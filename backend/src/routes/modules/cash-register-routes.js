const express = require("express");
const router = express.Router();
const { requireEmployee } = require("../../middleware/authorization.middleware.js");

const {
  openCashRegister,
  closeCashRegister,
  getCashRegisterHistory,
  addShiftSale
} = require("../../modules/cash-register/cash-register.controller.js");

router.post("/open", requireEmployee, openCashRegister);
router.post("/close", requireEmployee, closeCashRegister);
router.get("/history", getCashRegisterHistory);
router.post("/sale", addShiftSale);

module.exports = router;