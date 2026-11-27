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

const list = async ({ employee_id, period } = {}) => {
    const conditions = [];
    const params = [];

    if (employee_id !== undefined) {
        params.push(employee_id);
        conditions.push(`p.employee_id = $${params.length}`);
    }

    if (period !== undefined) {
        params.push(period);
        conditions.push(`p.period = $${params.length}`);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
    const result = await pool.query(`
        SELECT
            p.id,
            p.employee_id,
            e.full_name AS employee_name,
            e.branch_id,
            b.name AS branch_name,
            TO_CHAR(p.period, 'YYYY-MM-DD') AS period,
            p.fortnight,
            p.base_salary,
            p.isss,
            p.afp,
            p.isr,
            p.total_deduction,
            p.net_salary
        FROM payroll p
        INNER JOIN employee e ON e.id = p.employee_id
        INNER JOIN branch b ON b.id = e.branch_id
        ${whereClause}
        ORDER BY p.period DESC, p.fortnight DESC, e.full_name ASC
    `, params);
    return result.rows;
}

module.exports = {
    insert,
    list,
    getSalary,
    getEmployee,
    insertMany
};