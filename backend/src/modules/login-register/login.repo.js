const pool = require("../../config/config.js")

const customerEmail = async ({ email }) => {
    const result = await pool.query(
        `SELECT id, email, password_hash FROM customer
          WHERE email = $1`
        , [email])
    return result.rows[0];
}
const employeeEmail = async ({ email }) => {
    const result = await pool.query(
        `SELECT id, role, email, password_hash FROM employee
          WHERE email = $1`
        , [email])
    return result.rows[0];
}

module.exports = {
    customerEmail,
    employeeEmail
};