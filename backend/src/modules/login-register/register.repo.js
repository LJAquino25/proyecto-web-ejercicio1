const pool = require("../../config/config.js")

const insert = async ({ full_name, email, phone, address, password_hash }) => {
    const result = await pool.query(
        `INSERT INTO customer (full_name, email, phone, address, password_hash) 
        VALUES($1, $2, $3, $4, $5)
        RETURNING id, full_name, email, phone, address;`
        , [full_name, email, phone, address, password_hash])
    return result.rows;
}

const update = async ({ full_name, email, phone, address, id }) => {
    const result = await pool.query(
        `UPDATE customer 
        SET 
            full_name = COALESCE($1, full_name), 
            email = COALESCE($2, email),
            phone = COALESCE($3, phone), 
            address = COALESCE($4, address)
        WHERE id = $5 
        RETURNING id, full_name, email, phone, address;`
        , [full_name, email, phone, address, id])
    return result.rows[0];
}

const remove = async ({ id }) => {
    const result = await pool.query("DELETE FROM customer WHERE id = $1 RETURNING id, full_name, email;", [id])
    return result.rows[0];
}

const list = async ({ id }) => {
    const result = await pool.query(`
        SELECT
            id,
            full_name,
            email,
            phone,
            address
        FROM customer
        WHERE id = $1`
        , [id]);
    return result.rows[0];
}

module.exports = {
    insert,
    update,
    remove,
    list
};