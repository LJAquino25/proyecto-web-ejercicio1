const express = require("express");
const router = express.Router();

const {
    createCustomer,
    editCustomer,
    deleteCustomer,
    listCustomer
} = require("../../modules/login-register/register.controller.js")

const {
    login
} = require("../../modules/login-register/login.controller.js")

router.post("/customer", createCustomer)
router.get("/customer", listCustomer)
router.put("/customer", editCustomer)
router.delete("/customer", deleteCustomer)

router.post("/login", login)

module.exports = router;
