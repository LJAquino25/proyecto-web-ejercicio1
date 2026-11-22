const {
  getAllCashRegisters,
  getOpenCashRegister,
  resolveCashRegisterAndEmployee,
  addCashRegister,
  updateCashSessionClose,
  incrementCashSessionSale,
  getTotalSalesAmount
} = require("../../data/data.cash-register.js");

const roundTwo = (value) => Number(Number(value).toFixed(2));

const normalizePaymentMethod = (rawMethod) => {
  const normalized = String(rawMethod || "").trim().toLowerCase();

  if (["cash", "efectivo"].includes(normalized)) {
    return "cash";
  }

  if (["card", "tarjeta", "tarjetas", "debit", "credit"].includes(normalized)) {
    return "card";
  }

  if (
    [
      "bitcoin",
      "btc",
      "chivo",
      "chivo wallet",
      "chivo_wallet",
      "crypto",
      "pago digital",
      "digital"
    ].includes(normalized)
  ) {
    return "bitcoinChivo";
  }

  return null;
};

// POST /api/cash-register/open
const openCashRegister = async (req, res) => {
  try {
    const {
      openingAmount,
      branch = "Main Branch",
      cashier = "Shift Cashier",
      cashRegisterId = null,
      employeeId = null,
      notes = ""
    } = req.body;

    const initialAmount = Number(openingAmount);

    if (Number.isNaN(initialAmount) || initialAmount < 0) {
      return res.status(400).json({
        ok: false,
        message: "The opening amount must be a number greater than or equal to 0."
      });
    }

    const existingOpen = await getOpenCashRegister(branch);
    if (existingOpen) {
      return res.status(409).json({
        ok: false,
        message: `There is already an open cash register for "${existingOpen.branch}".`,
        openRegister: existingOpen
      });
    }

    const resolved = await resolveCashRegisterAndEmployee({
      branch,
      cashier,
      cashRegisterId,
      employeeId
    });

    if (!resolved.cashRegisterId || !resolved.employeeId) {
      return res.status(400).json({
        ok: false,
        message:
          "Missing valid cash_register or active employee in the database to open the shift."
      });
    }

    const roundedOpening = roundTwo(initialAmount);
    const newShift = await addCashRegister({
      cashRegisterId: resolved.cashRegisterId,
      employeeId: resolved.employeeId,
      openingAmount: roundedOpening,
      expectedCash: roundedOpening,
      notes
    });

    return res.status(201).json({
      ok: true,
      message: "Cash register opening recorded successfully.",
      data: newShift
    });
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
    const {
      countedCash,
      declaredCard = null,
      declaredDigital = null,
      branch = null,
      notes = ""
    } = req.body;

    const physicalCash = Number(countedCash);
    if (Number.isNaN(physicalCash) || physicalCash < 0) {
      return res.status(400).json({
        ok: false,
        message:
          "The counted cash (countedCash) must be a number greater than or equal to 0."
      });
    }

    const openShift = await getOpenCashRegister(branch);
    if (!openShift) {
      return res.status(404).json({
        ok: false,
        message: "There is no open cash register to close."
      });
    }

    const cashSales = roundTwo(openShift.salesByMethod.cash);
    const cardSales = roundTwo(openShift.salesByMethod.card);
    const bitcoinChivoSales = roundTwo(openShift.salesByMethod.bitcoinChivo);

    const expectedCash = roundTwo(openShift.openingAmount + cashSales);
    const roundedCountedCash = roundTwo(physicalCash);
    const difference = roundTwo(roundedCountedCash - expectedCash);

    const closedShift = await updateCashSessionClose({
      sessionId: openShift.id,
      countedCash: roundedCountedCash,
      declaredCard,
      declaredDigital,
      notes
    });

    const totalSales = getTotalSalesAmount(closedShift.salesByMethod);

    return res.status(200).json({
      ok: true,
      message: "Cash register closed successfully.",
      data: {
        shift: closedShift,
        summary: {
          openingAmount: closedShift.openingAmount,
          salesByMethod: {
            cash: cashSales,
            card: cardSales,
            bitcoinChivo: bitcoinChivoSales
          },
          totalSales,
          expectedCash,
          countedCash: roundedCountedCash,
          difference,
          reconciliationStatus:
            difference === 0
              ? "EXACT_MATCH"
              : difference > 0
              ? "OVERAGE"
              : "SHORTAGE"
        }
      }
    });
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
    const history = await getAllCashRegisters({ status, branch });

    const enrichedHistory = history.map((shift) => {
      const cashSales = roundTwo(shift.salesByMethod.cash);
      const expectedCash = roundTwo(shift.openingAmount + cashSales);
      const totalSales = getTotalSalesAmount(shift.salesByMethod);

      return {
        ...shift,
        expectedCash,
        totalSales
      };
    });

    return res.status(200).json({
      ok: true,
      count: enrichedHistory.length,
      data: enrichedHistory
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal error while retrieving shift history.",
      error: error.message
    });
  }
};

// Function for Sales and Billing to accumulate sales into the open shift
const registerSaleToOpenShift = async ({
  amount,
  paymentMethod,
  branch = null
}) => {
  const numericAmount = Number(amount);
  const methodKey = normalizePaymentMethod(paymentMethod);

  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return { ok: false, message: "The sale amount must be greater than 0." };
  }

  if (!methodKey) {
    return {
      ok: false,
      message: "Invalid payment method (cash, card, or Bitcoin/Chivo Wallet)."
    };
  }

  const openShift = await getOpenCashRegister(branch);
  if (!openShift) {
    return {
      ok: false,
      message: "There is no open cash register to record the sale."
    };
  }

  const updatedShift = await incrementCashSessionSale({
    sessionId: openShift.id,
    methodKey,
    amount: numericAmount
  });

  return {
    ok: true,
    shift: updatedShift
  };
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