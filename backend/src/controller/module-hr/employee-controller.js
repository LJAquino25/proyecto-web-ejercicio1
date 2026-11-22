const { json } = require("express");
const model = require("../../models/module-hr/employee-model.js")
const bycrypjs = require("bcryptjs")

const createEmployee = async (req, res) => {
    try {
        const { branch_id, role, full_name, email, password, monthly_salary, is_active } = req.body;
        if (!branch_id || !role || !full_name || !email || !password || !monthly_salary || !is_active) {
            return res.status(400).json({ message: "Required fields" })
        }
        let password_hash = await bycrypjs.hash(password, 8)
        const insertEmployee = await model.insert({ branch_id, role, full_name, email, password_hash, monthly_salary, is_active })
        return res.status(201).json({
            message: "Employee registered successfully",
            employee: insertEmployee
        })
    } catch (error) {
        if (error.code === "23505") {
            res.status(409).json({ mensage: "The email address is already in use." });
        }
        res.status(400).json({ mensage: "Error registering employee" });
    }
}

const editEmployee = async (req, res) => {
    try {
        const { branch_id, role, full_name, email, monthly_salary, is_active} = req.body;
        if (!branch_id || !role || !full_name || !email || !monthly_salary || !is_active) {
            return res.status(400).json({ message: "Required fields" })
        }
        const updateEmployee = await model.update({ branch_id, role, full_name, email, monthly_salary, is_active })
        if (!updateEmployee) {
            return res.status(404).json({ message: "Employee not found" })
        }
        return res.status(201).json({
            message: "Employee updated successfully",
            employee: updateEmployee
        })
    } catch (error) {
        res.status(400).json({ mensage: "Error editing employee" });
    }
}

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Required fields" })
        }
        const removeEmployee = await model.remove({ id })
        if (!removeEmployee) {
            return res.status(404).json({ message: "Employee not found" })
        }
        return res.status(201).json({
            message: "Employee successfully deleted",
            employee: removeEmployee
        })
    } catch (error) {
        res.status(400).json({ mensage: "Error deleting employee" });
    }
}

const listEmployee = async (req, res) => {
    try {
        const { type } = req.body;
        if (!type) {
            return res.status(400).json({ message: "Required fields" })
        }
        const listEmployee = await model.list({ type });
        return res.status(201).json({
            message: "List of employees",
            employee: listEmployee
        })
    } catch (error) {
        res.status(400).json({ mensage: "Error listing employees" });
    }

}

module.exports = {
    createEmployee,
    editEmployee,
    deleteEmployee,
    listEmployee
};
