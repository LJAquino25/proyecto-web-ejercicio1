const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/jwt.middleware.js")
const { requireCustomer } = require("../../middleware/authorization.middleware.js");

const {
    createCustomer,
    editCustomer,
    deleteCustomer,
    listCustomer
} = require("../../modules/login-register/register.controller.js")

const {
    login,
    logout
} = require("../../modules/login-register/login.controller.js")

router.post("/customer", createCustomer)
router.get("/customer", verifyToken, listCustomer)
router.put("/customer", verifyToken, requireCustomer, editCustomer)
router.delete("/customer", verifyToken, requireCustomer, deleteCustomer)

router.post("/login", login)
router.post("/logout", logout);

module.exports = router;
