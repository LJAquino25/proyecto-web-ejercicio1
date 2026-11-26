const repo = require("./login.repo.js");
const jwt = require("jsonwebtoken");
const bycrypjs = require("bcryptjs")

const createHttpError = (statusCode, message) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

const login = async ({ email, password }) => {
    if (!email || !password) {
        throw createHttpError(400, "Required fields");
    }

    const employee = await repo.employeeEmail({ email })
    if (employee) {
        const compare = await bycrypjs.compare(password, employee.password_hash)
        if (!compare) {
            throw createHttpError(401, "Invalid credentials");
        }
        const token = jwt.sign({
            id: employee.id,
            role: employee.role,
            accountType: "employee",
        },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        )
        return {
            token,
            accountType: "employee",
            role: employee.role,
            branchId: employee.branch_id
        }
    }

    const customer = await repo.customerEmail({ email })
    if (!customer) {
        throw createHttpError(404, "Customer not found");
    }
    const compare = await bycrypjs.compare(password, customer.password_hash)
    if (!compare) {
        throw createHttpError(401, "Invalid credentials");
    }
    const token = jwt.sign({
        id: customer.id,
        email: customer.email,
        accountType: "customer"
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    )
    return {
        token,
        accountType: "customer"
    }
}

module.exports = {
    login
};