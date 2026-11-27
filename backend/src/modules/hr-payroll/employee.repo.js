const pool = require("../../config/config.js")

const insert = async ({ branch_id, role, full_name, email, password_hash, monthly_salary, is_active }) => {
    const result = await pool.query(
        `INSERT INTO employee (branch_id, role, full_name, email, password_hash, monthly_salary, is_active) 
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, branch_id, role, full_name, email, monthly_salary, is_active;`
        , [branch_id, role, full_name, email, password_hash, monthly_salary, is_active])
    return result.rows[0];
}

const update = async ({ branch_id, role, full_name, email, monthly_salary, is_active, id }) => {
    const result = await pool.query(
        `UPDATE employee 
        SET 
            branch_id = COALESCE($1, branch_id), 
            role = COALESCE($2, role),
            full_name = COALESCE($3, full_name), 
            email = COALESCE($4, email), 
            monthly_salary = COALESCE($5, monthly_salary), 
            is_active = COALESCE($6, is_active) 
        WHERE id = $7 
        RETURNING id, branch_id, role, full_name, email, monthly_salary, is_active;`
        , [branch_id, role, full_name, email, monthly_salary, is_active, id])
    return result.rows[0];
}

const remove = async ({ id }) => {
    const result = await pool.query("DELETE FROM employee WHERE id = $1 RETURNING id, full_name, email;", [id])
    return result.rows[0];
}

const list = async ({ type }) => {
    const params = [];
    let roleFilter = "";
    if (type) {
        params.push(type);
        roleFilter = `WHERE e.role = $${params.length}`;
    }
    const result = await pool.query(`
        SELECT
            e.id,
            e.branch_id,
            b.name AS branch_name,
            e.role,
            e.full_name,
            e.email,
            e.monthly_salary,
            e.is_active
        FROM employee e
        INNER JOIN branch b ON e.branch_id = b.id
        ${roleFilter}
        ORDER BY e.id ASC;`,
        params);
    return result.rows;
}

module.exports = {
    insert,
    update,
    remove,
    list
};