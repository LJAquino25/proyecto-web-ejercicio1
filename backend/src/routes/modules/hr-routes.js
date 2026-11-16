const express = require("express");
const router = express.Router();

const {
    addEmployee,
    listEmployee
} = require ("../../controller/module-hr/employee-controller.js")

const {
    createPayroll,
    listPayroll
} = require ("../../controller/module-hr/payroll-controller.js")

router.post("/employee/:type", addEmployee)
router.get("/employee/:type", listEmployee)
router.post("/payroll/:id", createPayroll)
router.get("/payroll", listPayroll)

module.exports = router;
