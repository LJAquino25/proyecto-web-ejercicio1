const express = require("express");
const router = express.Router();

const {
  openCashRegister,
  closeCashRegister,
  getCashRegisterHistory,
  addShiftSale
} = require("../../controller/module-cash-register/cash-register.controller.js");

router.post("/open", openCashRegister);
router.post("/close", closeCashRegister);
router.get("/history", getCashRegisterHistory);
router.post("/sale", addShiftSale);

module.exports = router;