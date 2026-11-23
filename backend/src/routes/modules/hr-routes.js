const express = require("express");
const router = express.Router();

const {
    createEmployee,
    editEmployee,
    deleteEmployee,
    listEmployee
} = require("../../modules/hr-payroll/employee.controller.js")

const {
    createPayroll,
    listPayroll
} = require("../../modules/hr-payroll/payroll.controller.js")

router.post("/employee", createEmployee)
router.get("/employee", listEmployee)
router.put("/employee", editEmployee)
router.delete("/employee", deleteEmployee)

router.post("/payroll", createPayroll)
router.get("/payroll", listPayroll)

module.exports = router;
