const { json } = require("express");
const service = require("./register.service.js")

const createCustomer = async (req, res) => {
    try {
        const { full_name, email, phone, address, password } = req.body;
        const insertCustomer = await service.createCustomer({ full_name, email, phone, address, password })
        return res.status(201).json({
            message: "Customer created successfully",
            customer: insertCustomer
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error creating customer",
        });
    }
}

const editCustomer = async (req, res) => {
    try {
        const { full_name, email, phone, address } = req.body;
        const { id } = req.user;
        const updateCustomer = await service.editCustomer({ id, full_name, email, phone, address })
        return res.status(201).json({
            message: "Customer updated successfully",
            customer: updateCustomer
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error editing customer"
        });
    }
}

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.user;
        const removeCustomer = await service.deleteCustomer({ id })
        return res.status(201).json({
            message: "Customer successfully deleted",
            customer: removeCustomer
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error deleting customer"
        });
    }
}

const listCustomer = async (req, res) => {
    try {
        const { id } = req.user;
        const listCustomer = await service.listCustomer({ id });
        return res.status(201).json({
            message: "List of customers",
            customer: listCustomer
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error listing customers"
        });
    }

}

module.exports = {
    createCustomer,
    editCustomer,
    deleteCustomer,
    listCustomer
};
