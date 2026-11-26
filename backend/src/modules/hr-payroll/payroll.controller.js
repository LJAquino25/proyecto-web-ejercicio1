const { json } = require("express");
const service = require("./payroll.service.js")

const createPayroll = async (req, res) => {
    try {
        const { employee_id, period, fortnight } = req.body;
        const insertPayroll = await service.createPayroll({ employee_id, period, fortnight})
        return res.status(201).json({
            message: "Payroll created successfully",
            employee: insertPayroll
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error creating payroll",
        });
    }
}

const listPayroll = async (req, res) => {
    try {
        const { employee_id, period } = req.query;
        const listPayroll = await service.listPayroll({ employee_id, period });
        return res.status(200).json({
            message: "List of payroll",
            payroll: listPayroll
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error listing payroll",
        });
    }
}

module.exports = {
    createPayroll,
    listPayroll
};
