const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/jwt.middleware.js")

const {
    createCustomer,
    editCustomer,
    deleteCustomer,
    listCustomer
} = require("../../modules/login-register/register.controller.js")

const {
    login
} = require("../../modules/login-register/login.controller.js")

router.post("/customer", verifyToken, createCustomer)
router.get("/customer", verifyToken, listCustomer)
router.put("/customer", verifyToken, editCustomer)
router.delete("/customer", verifyToken, deleteCustomer)

router.post("/login", login)

module.exports = router;
