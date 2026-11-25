const requireEmployee = (req, res, next) => {
  if (req.user?.accountType !== "employee") {
    return res.status(403).json({
      error: "Employees only"
    });
  }

  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user?.accountType !== "employee") {
    return res.status(403).json({
      error: "Employees only"
    });
  }

  if (req.user.role !== "GERENTE") {
    return res.status(403).json({
      error: "Admin role required"
    });
  }

  next();
};

module.exports = {
  requireEmployee,
  requireAdmin
};