const repo = require("./employee.repo.js");
const bycrypjs = require("bcryptjs")

const createHttpError = (statusCode, message) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

const createEmployee = async ({ branch_id, role, full_name, email, password, monthly_salary, is_active }) => {
    if (!branch_id || !role || !full_name || !email || !password || !monthly_salary || is_active === undefined) {
        throw createHttpError(400, "Required fields");
    }
    let password_hash = await bycrypjs.hash(password, 8)
    try {
        const insertEmployee = await repo.insert({
            branch_id, role, full_name, email, password_hash, monthly_salary, is_active
        });
        return insertEmployee
    } catch (error) {
        if (error.code === "23505") {
            throw createHttpError(409, "The email address is already in use.");
        }
        throw error;
    }
}

const editEmployee = async ({ id, branch_id, role, full_name, email, monthly_salary, is_active }) => {
    if (!branch_id || !role || !full_name || !email || !monthly_salary || is_active === undefined) {
        throw createHttpError(400, "Required fields");
    }

    const updateEmployee = await repo.update({ id, branch_id, role, full_name, email, monthly_salary, is_active });

    if (!updateEmployee) {
        throw createHttpError(404, "Employee not found");
    }

    return updateEmployee;
}

const deleteEmployee = async ({ id }) => {
    if (!id) {
        throw createHttpError(400, "Required fields");
    }

    const removeEmployee = await repo.remove({ id });
    if (!removeEmployee) {
        throw createHttpError(404, "Employee not found");
    }

    return removeEmployee;
}

const listEmployee = async ({ type }) => {
    const listEmployee = await repo.list({ type });
    return listEmployee;

}

module.exports = {
    createEmployee,
    editEmployee,
    deleteEmployee,
    listEmployee
};
