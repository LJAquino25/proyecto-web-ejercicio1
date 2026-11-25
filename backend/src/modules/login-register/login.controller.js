const { json } = require("express");
const service = require("./login.service.js")

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const login = await service.login({ email, password })

        res.cookie("token", login.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",//Seguridad HTTPS
            sameSite: "lax",
            maxAge: login.accountType === "employee"
                ? 2 * 60 * 60 * 1000
                : 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "login successfully",
            customer: login.accountType
        })
    } catch (error) {
        const status = error.statusCode || 400;
        return res.status(status).json({
            message: error.message || "Error login",
        });
    }
}

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",//Seguridad HTTPS
    sameSite: "lax"
  });

  return res.status(200).json({
    message: "Logout successful"
  });
};

module.exports = {
    login,
    logout
};
