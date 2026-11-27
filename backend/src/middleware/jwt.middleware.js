const jwt = require("jsonwebtoken");
const pool = require("../config/config.js");

const verifyToken = async (req, res, next) => {

    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(400).json({ error: "Invalid token" })
    }

    req.user = {
        id: payload.id,
        accountType: payload.accountType
    }
    if (payload.accountType === "employee") {
        req.user.role = payload.role
        req.user.branchId = payload.branchId

        if (!Number.isInteger(Number(req.user.branchId)) || Number(req.user.branchId) <= 0) {
            try {
                const result = await pool.query(
                    "SELECT branch_id FROM employee WHERE id = $1",
                    [payload.id],
                )
                if (!result.rows[0]) {
                    return res.status(401).json({ error: "Employee account not found" })
                }
                req.user.branchId = result.rows[0].branch_id
            } catch (error) {
                return next(error)
            }
        }
    }

    return next();

}

module.exports = {
    verifyToken
};
