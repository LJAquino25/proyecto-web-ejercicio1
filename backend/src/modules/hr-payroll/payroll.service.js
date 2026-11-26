const repo = require("./payroll.repo.js");

const createHttpError = (statusCode, message) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

const round2 = (num) => Number(Number(num).toFixed(2));

const createPayroll = async ({ employee_id, period, fortnight }) => {
    if (!employee_id || !period || !fortnight) {
        throw createHttpError(400, "Required fields");
    }
    const employeeSalary = await repo.getSalary({ employee_id })
    if (!employeeSalary) {
        throw createHttpError(404, "Employee not found");
    }

    const base_salary = Number((Number(employeeSalary.monthly_salary) / 2).toFixed(2));
    const isss = round2(Math.min(base_salary, 500) * 0.03);
    const afp = round2(base_salary * 0.0725);
    const taxableIncome = base_salary - isss - afp;
    let isr = 0
    if (taxableIncome <= 275.00) {
        isr = 0;
    } else if (taxableIncome <= 447.62) {
        isr = (taxableIncome - 275.00) * 0.10 + 8.83;
    } else if (taxableIncome <= 1019.05) {
        isr = (taxableIncome - 447.62) * 0.20 + 30.00;
    } else {
        isr = (taxableIncome - 1019.05) * 0.30 + 144.28;
    }
    isr = round2(Math.max(0, isr));

    try {
        return await repo.insert({
            employee_id,
            period,
            fortnight,
            base_salary,
            isss,
            afp,
            isr,
        });
    } catch (error) {
        if (error.code === "23505") {
            throw createHttpError(409, "The payroll is already in created.");
        }
        throw error;
    }
}

const listPayroll = async ({ employee_id, period }) => {
    const filters = {};

    if (employee_id !== undefined) {
        const parsedEmployeeId = Number(employee_id);
        if (!Number.isInteger(parsedEmployeeId) || parsedEmployeeId < 1) {
            throw createHttpError(400, "Invalid employee_id");
        }
        filters.employee_id = parsedEmployeeId;
    }

    if (period !== undefined) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(period)) {
            throw createHttpError(400, "Invalid period");
        }
        filters.period = period;
    }

    return await repo.list(filters)
}

module.exports = {
    createPayroll,
    listPayroll
};