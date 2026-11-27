const pool = require("../../config/config.js")

const insert = async ({ employee_id, period, fortnight, base_salary, isss, afp, isr }) => {
    const result = await pool.query(
        `INSERT INTO payroll (employee_id, period, fortnight, base_salary, isss, afp, isr) 
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING employee_id, period, fortnight, base_salary, isss, afp, isr, total_deduction, net_salary;`
        , [employee_id, period, fortnight, base_salary, isss, afp, isr])
    return result.rows;
}

const getSalary = async ({ employee_id }) => {
    const result = await pool.query(`SELECT monthly_salary FROM employee WHERE id = $1;`, [employee_id])
    return result.rows[0];
}

const list = async ({ employee_id, period }) => {
    const result = await pool.query(` SELECT employee_id, period, fortnight, base_salary, isss, afp, isr, total_deduction, net_salary FROM payroll WHERE employee_id = $1 AND period = $2 ORDER BY fortnight ASC`
        , [employee_id, period]);
    return result.rows;
}

module.exports = {
    insert,
    list,
    getSalary
};