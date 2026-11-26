const { json } = require("express");
const service = require("./employee.service.js")


const createEmployee = async (req, res) => {
    try {
        const { branch_id, role, full_name, email, password, monthly_salary, is_active } = req.body;
        const insertEmployee = await service.createEmployee({ branch_id, role, full_name, email, password, monthly_salary, is_active })
        return res.status(201).json({
            message: "Employee registered successfully",
            employee: insertEmployee
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error registering employee"
        });
    }
}

const editEmployee = async (req, res) => {
    try {
        const { id, branch_id, role, full_name, email, monthly_salary, is_active } = req.body;
        const updateEmployee = await service.editEmployee({ id, branch_id, role, full_name, email, monthly_salary, is_active })
        return res.status(201).json({
            message: "Employee updated successfully",
            employee: updateEmployee
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error editing employee"
        });
    }
}

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.body;
        const removeEmployee = await service.deleteEmployee({ id })
        return res.status(201).json({
            message: "Employee successfully deleted",
            employee: removeEmployee
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error deleting employee"
        });
    }
}

const listEmployee = async (req, res) => {
    try {
        const { type } = req.query;
        const listEmployee = await service.listEmployee({ type });
        return res.status(200).json({
            message: "List of employees",
            employee: listEmployee
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error listing employees"
        });
    }

}

module.exports = {
    createEmployee,
    editEmployee,
    deleteEmployee,
    listEmployee
};
