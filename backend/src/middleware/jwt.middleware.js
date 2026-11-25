const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
            id: payload.id,
            accountType: payload.accountType
        }
        if (payload.accountType === "employee") {
            req.user.role = payload.role
        }

        next();
    } catch (error) {
        return res.status(400).json({ error: "Invalid token" })
    }

}

module.exports = {
    verifyToken
};
