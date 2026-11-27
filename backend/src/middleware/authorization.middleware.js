const requireEmployee = (req, res, next) => {
  if (req.user?.accountType !== "employee") {
    return res.status(403).json({
      error: "Employees only"
    });
  }

  next();
};

const requireCashier = (req, res, next) => {
  if (
    req.user?.accountType !== "employee" ||
    String(req.user.role || "").toUpperCase() !== "CAJERO"
  ) {
    return res.status(403).json({
      message: "Solo los empleados con cargo de cajero pueden operar la caja."
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

const requireKitchenStaff = (req, res, next) => {
  const role = String(req.user?.role || "").toUpperCase();
  if (
    req.user?.accountType !== "employee" ||
    !["GERENTE", "COCINERO"].includes(role)
  ) {
    return res.status(403).json({
      message: "Solo gerencia y cocina pueden administrar recetas."
    });
  }

  next();
};

const requireCustomer = (req, res, next) => {
  if (req.user?.accountType !== "customer") {
    return res.status(403).json({ error: "Customers only" });
  }

  next();
};

module.exports = {
  requireEmployee,
  requireCashier,
  requireAdmin,
  requireKitchenStaff,
  requireCustomer
};