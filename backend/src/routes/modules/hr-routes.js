const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../../middleware/authorization.middleware.js");

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

router.post("/employee", requireAdmin, createEmployee)
router.get("/employee", requireAdmin, listEmployee)
router.put("/employee", requireAdmin, editEmployee)
router.delete("/employee", requireAdmin, deleteEmployee)

router.post("/payroll", requireAdmin, createPayroll)
router.get("/payroll", requireAdmin, listPayroll)

module.exports = router;
