const { json } = require("express");
const employeeModel = require("../../models/module-hr/payroll-model.js")

const createPayroll = async (req, res) => {
    try {
        const { employee_id, period, fortnight } = req.body;
        if (!employee_id || !period || !fortnight) {
            return res.status(400).json({ message: "Required fields" })
        }
        const employeeSalary = await model.getSalary({ employee_id })
        if (!employeeSalary) {
            return res.status(404).json({ message: "Employee not found" })
        }

        const base_salary = Number((Number(employeeSalary.monthly_salary) / 2).toFixed(2));
        const isss = round2(Math.min(base_salary, 500) * 0.03);
        const afp = round2(base_salary * 0.0725);
        const taxableIncome = base_salary - isss - afp;
        let isr = 0
        if (taxableIncome <= 275.00) {
            isr = 0;
        } else if (taxableIncome <= 447.62) {
            isr = (taxableIncome - 275.00) * 0.10 + 8.83;
        } else if (taxableIncome <= 1019.05) {
            isr = (taxableIncome - 447.62) * 0.20 + 30.00;
        } else {
            isr = (taxableIncome - 1019.05) * 0.30 + 144.28;
        }
        isr = round2(Math.max(0, isr));
        const insertPayroll = await model.insert({ employee_id, period, fortnight, base_salary, isss, afp, isr })
        return res.status(201).json({
            message: "Payroll created successfully",
            employee: insertPayroll
        })
    } catch (error) {
        if (error.code === "23505") {
            res.status(409).json({ mensage: "The payroll is already in created." });
        }
        res.status(400).json({ mensage: "Error creating payroll" });
    }
}

const listPayroll = async (req, res) => {
    try {
        const { employee_id, period } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Required fields" })
        }
        const listPayroll = await model.list({ employee_id, period });
        return res.status(201).json({
            message: "List of payroll",
            employee: listPayroll
        })
    } catch (error) {
        res.status(400).json({ mensage: "Error listing payroll" });
    }
}

module.exports = {
    createPayroll,
    listPayroll
};
