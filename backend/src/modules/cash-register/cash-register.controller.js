const {
  openShiftService,
  closeShiftService,
  getShiftHistoryService,
  registerSaleToOpenShift
} = require("./cash-register.services.js");

// POST /api/cash-register/open
const openCashRegister = async (req, res) => {
  try {
    const result = await openShiftService({
      ...req.body,
      employeeId: req.user.id
    });
    return res.status(result.statusCode).json(result.payload);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal error while opening the cash register.",
      error: error.message
    });
  }
};

// POST /api/cash-register/close
const closeCashRegister = async (req, res) => {
  try {
    const result = await closeShiftService({
      ...req.body,
      employeeId: req.user.id
    });
    return res.status(result.statusCode).json(result.payload);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal error while closing the cash register.",
      error: error.message
    });
  }
};

// GET /api/cash-register/history
const getCashRegisterHistory = async (req, res) => {
  try {
    const { status, branch } = req.query;
    const result = await getShiftHistoryService({ status, branch });
    return res.status(result.statusCode).json(result.payload);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal error while retrieving shift history.",
      error: error.message
    });
  }
};

// Helper route to simulate test sales in the open shift
const addShiftSale = async (req, res) => {
  try {
    const { amount, paymentMethod, branch = null } = req.body;
    const result = await registerSaleToOpenShift({
      amount,
      paymentMethod,
      branch
    });

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      ok: true,
      message: "Sale recorded in the open shift.",
      data: result.shift
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal error while recording the sale in the cash register.",
      error: error.message
    });
  }
};

module.exports = {
  openCashRegister,
  closeCashRegister,
  getCashRegisterHistory,
  registerSaleToOpenShift,
  addShiftSale
};