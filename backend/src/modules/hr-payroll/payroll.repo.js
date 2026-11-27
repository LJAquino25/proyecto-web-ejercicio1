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

const getEmployee = async ({ branch_id }) => {
    const result = await pool.query(
        `SELECT id AS employee_id, monthly_salary
         FROM employee
         WHERE branch_id = $1 AND is_active = TRUE
         ORDER BY id ASC;`,
        [branch_id]
    );
    return result.rows;
}

const insertMany = async (payrolls) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const insertedPayrolls = [];

        for (const payroll of payrolls) {
            const result = await client.query(
                `INSERT INTO payroll (employee_id, period, fortnight, base_salary, isss, afp, isr) 
             VALUES($1, $2, $3, $4, $5, $6, $7)
             RETURNING employee_id, period, fortnight, base_salary, isss, afp, isr, total_deduction, net_salary;`,
                [
                    payroll.employee_id,
                    payroll.period,
                    payroll.fortnight,
                    payroll.base_salary,
                    payroll.isss,
                    payroll.afp,
                    payroll.isr
                ]
            );

            insertedPayrolls.push(result.rows[0]);
        }

        await client.query("COMMIT");
        return insertedPayrolls;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

const list = async ({ employee_id, period }) => {
    const result = await pool.query(` SELECT employee_id, period, fortnight, base_salary, isss, afp, isr, total_deduction, net_salary FROM payroll WHERE employee_id = $1 AND period = $2 ORDER BY fortnight ASC`
        , [employee_id, period]);
    return result.rows;
}

module.exports = {
    insert,
    list,
    getSalary,
    getEmployee,
    insertMany
};