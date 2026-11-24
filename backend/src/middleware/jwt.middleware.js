const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token not provided" });
    }

    const token = token.split(" ")[1]

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
