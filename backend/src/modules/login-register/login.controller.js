const { json } = require("express");
const service = require("./login.service.js")

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const login = await service.login({ email, password })
        return res.status(201).json({
            message: "login successfully",
            customer: login
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error login",
        });
    }
}

module.exports = {
    login
};
