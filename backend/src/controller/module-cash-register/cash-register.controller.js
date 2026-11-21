const {
  getAllCashRegisters,
  getOpenCashRegister,
  addCashRegister,
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
      branch = "Sucursal Principal",
      cashier = "Cajero Turno"
    } = req.body;

    const initialAmount = Number(openingAmount);

    if (Number.isNaN(initialAmount) || initialAmount < 0) {
      return res.status(400).json({
        ok: false,
        message: "El monto inicial debe ser un número mayor o igual a 0."
      });
    }

    const existingOpen = getOpenCashRegister(branch);
    if (existingOpen) {
      return res.status(409).json({
        ok: false,
        message: `Ya existe una caja abierta para "${existingOpen.branch}".`,
        openRegister: existingOpen
      });
    }

    const newShift = addCashRegister({
      branch: String(branch).trim(),
      cashier: String(cashier).trim(),
      openingAmount: roundTwo(initialAmount),
      openedAt: new Date().toISOString(),
      closedAt: null,
      status: "OPEN",
      salesByMethod: {
        cash: 0,
        card: 0,
        bitcoinChivo: 0
      },
      expectedCash: roundTwo(initialAmount),
      countedCash: null,
      difference: null
    });

    return res.status(201).json({
      ok: true,
      message: "Apertura de caja registrada correctamente.",
      data: newShift
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error interno al abrir la caja.",
      error: error.message
    });
  }
};

// POST /api/cash-register/close
const closeCashRegister = async (req, res) => {
  try {
    const { countedCash, branch = null, notes = "" } = req.body;

    const physicalCash = Number(countedCash);
    if (Number.isNaN(physicalCash) || physicalCash < 0) {
      return res.status(400).json({
        ok: false,
        message: "El efectivo contado (countedCash) debe ser un número mayor o igual a 0."
      });
    }

    const openShift = getOpenCashRegister(branch);
    if (!openShift) {
      return res.status(404).json({
        ok: false,
        message: "No hay una caja abierta para cerrar."
      });
    }

    const cashSales = roundTwo(openShift.salesByMethod.cash);
    const cardSales = roundTwo(openShift.salesByMethod.card);
    const bitcoinChivoSales = roundTwo(openShift.salesByMethod.bitcoinChivo);

    const expectedCash = roundTwo(openShift.openingAmount + cashSales);
    const roundedCountedCash = roundTwo(physicalCash);
    const difference = roundTwo(roundedCountedCash - expectedCash);

    openShift.status = "CLOSED";
    openShift.closedAt = new Date().toISOString();
    openShift.expectedCash = expectedCash;
    openShift.countedCash = roundedCountedCash;
    openShift.difference = difference;
    openShift.notes = String(notes || "").trim();

    const totalSales = getTotalSalesAmount(openShift.salesByMethod);

    return res.status(200).json({
      ok: true,
      message: "Cierre de caja realizado correctamente.",
      data: {
        shift: openShift,
        summary: {
          openingAmount: openShift.openingAmount,
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
              ? "CUADRE_EXACTO"
              : difference > 0
              ? "SOBRANTE"
              : "FALTANTE"
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error interno al cerrar la caja.",
      error: error.message
    });
  }
};

// GET /api/cash-register/history
const getCashRegisterHistory = async (req, res) => {
  try {
    const { status, branch } = req.query;
    let history = getAllCashRegisters();

    if (status) {
      const normalizedStatus = String(status).trim().toUpperCase();
      history = history.filter((item) => item.status === normalizedStatus);
    }

    if (branch) {
      const normalizedBranch = String(branch).trim().toLowerCase();
      history = history.filter(
        (item) => item.branch.toLowerCase() === normalizedBranch
      );
    }

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
      message: "Error interno al consultar el historial de turnos.",
      error: error.message
    });
  }
};

// Función para que Ventas y Facturación acumule ventas al turno abierto
const registerSaleToOpenShift = ({ amount, paymentMethod, branch = null }) => {
  const numericAmount = Number(amount);
  const methodKey = normalizePaymentMethod(paymentMethod);

  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return { ok: false, message: "El monto de la venta debe ser mayor que 0." };
  }

  if (!methodKey) {
    return {
      ok: false,
      message: "Método de pago no válido (efectivo, tarjeta o Bitcoin/Chivo Wallet)."
    };
  }

  const openShift = getOpenCashRegister(branch);
  if (!openShift) {
    return {
      ok: false,
      message: "No hay una caja abierta para registrar la venta."
    };
  }

  openShift.salesByMethod[methodKey] = roundTwo(
    openShift.salesByMethod[methodKey] + numericAmount
  );
  openShift.expectedCash = roundTwo(
    openShift.openingAmount + openShift.salesByMethod.cash
  );

  return {
    ok: true,
    shift: openShift
  };
};

// Ruta auxiliar para simular ventas de prueba en el turno abierto
const addShiftSale = async (req, res) => {
  try {
    const { amount, paymentMethod, branch = null } = req.body;
    const result = registerSaleToOpenShift({ amount, paymentMethod, branch });

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      ok: true,
      message: "Venta registrada en el turno abierto.",
      data: result.shift
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error interno al registrar la venta en caja.",
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