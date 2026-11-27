const repo = require("./register.repo.js");
const bycrypjs = require("bcryptjs")

const createHttpError = (statusCode, message) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

const createCustomer = async ({ full_name, email, phone, address, password }) => {
    if (!full_name || !email || !phone || !address || !password) {
        throw createHttpError(400, "Required fields");
    }
    let password_hash = await bycrypjs.hash(password, 8)
    try {
        const insertCustomer = await repo.insert({ full_name, email, phone, address, password_hash })
        return insertCustomer
    } catch (error) {
        if (error.code === "23505") {
            throw createHttpError(409, "The email address is already in use.");
        }
        throw error;
    }
}

const editCustomer = async ({ id, full_name, email, phone, address }) => {
    if (!id || !full_name || !email || !phone || !address) {
        throw createHttpError(400, "Required fields");
    }

    const updateCustomer = await repo.update({ id, full_name, email, phone, address });

    if (!updateCustomer) {
        throw createHttpError(404, "Customer not found");
    }

    return updateCustomer;
}

const deleteCustomer = async ({ id }) => {
    if (!id) {
        throw createHttpError(400, "Required fields");
    }

    const removeCustomer = await repo.remove({ id });
    if (!removeCustomer) {
        throw createHttpError(404, "Customer not found");
    }

    return removeCustomer;
}

const listCustomer = async ({ id }) => {
    if (!id) {
        throw createHttpError(400, "Required fields");
    }
    const listCustomer = await repo.list({ id });
    return listCustomer;

}

module.exports = {
    createCustomer,
    editCustomer,
    deleteCustomer,
    listCustomer
};