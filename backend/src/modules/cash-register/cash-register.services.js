const {
  findCashSessions,
  findOpenCashSession,
  findCashRegisterById,
  findCashRegisterByBranchName,
  findEmployeeById,
  insertCashSession,
  closeCashSessionInDb,
  incrementCashSessionSaleColumn
} = require("./cash-register.repo.js");

const SALE_COLUMN_BY_METHOD = {
  cash: "expected_cash",
  card: "expected_card",
  bitcoinChivo: "expected_digital"
};

const roundTwo = (value) => Number(Number(value).toFixed(2));

const getTotalSalesAmount = (salesByMethod) => {
  const methods = [
    Number(salesByMethod?.cash) || 0,
    Number(salesByMethod?.card) || 0,
    Number(salesByMethod?.bitcoinChivo) || 0
  ];
  return roundTwo(methods.reduce((acc, current) => acc + current, 0));
};

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
      "digital",
      "transfer",
      "transferencia",
      "bank transfer"
    ].includes(normalized)
  ) {
    return "bitcoinChivo";
  }

  return null;
};

const mapRowToShift = (row) => {
  if (!row) return null;

  const openingAmount = roundTwo(row.opening_amount);
  const expectedCash = roundTwo(row.expected_cash);
  const cardSales = roundTwo(row.expected_card);
  const bitcoinChivoSales = roundTwo(row.expected_digital);
  const cashSales = roundTwo(Math.max(0, expectedCash - openingAmount));

  const salesByMethod = {
    cash: cashSales,
    card: cardSales,
    bitcoinChivo: bitcoinChivoSales
  };

  const countedCash =
    row.declared_cash !== null && row.declared_cash !== undefined
      ? roundTwo(row.declared_cash)
      : null;

  const difference =
    countedCash !== null ? roundTwo(countedCash - expectedCash) : null;

  return {
    id: row.id,
    cashRegisterId: row.cash_register_id,
    registerName: row.register_name,
    branch: row.branch_name,
    branchId: row.branch_id,
    cashier: row.cashier_name,
    employeeId: row.employee_id,
    openingAmount,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    status: row.status,
    salesByMethod,
    expectedCash,
    countedCash,
    difference,
    totalSales: getTotalSalesAmount(salesByMethod),
    notes: row.notes || ""
  };
};

const resolveCashRegisterAndEmployee = async ({
  branch = "Main Branch",
  cashRegisterId = null,
  employeeId = null
}) => {
  let registerRow = null;

  if (cashRegisterId) {
    registerRow = await findCashRegisterById(cashRegisterId);
  } else if (branch) {
    registerRow = await findCashRegisterByBranchName(branch);
  }

  let employeeRow = null;

  if (employeeId) {
    employeeRow = await findEmployeeById(employeeId);
  }

  return {
    cashRegisterId: registerRow ? registerRow.id : null,
    cashRegisterBranchId: registerRow ? registerRow.branch_id : null,
    employeeId: employeeRow ? employeeRow.id : null,
    employeeBranchId: employeeRow ? employeeRow.branch_id : null,
    employeeRole: employeeRow ? employeeRow.role : null,
    employeeIsActive: employeeRow ? employeeRow.is_active : false
  };
};

const openShiftService = async ({
  openingAmount,
  branch = "Main Branch",
  cashRegisterId = null,
  employeeId = null,
  notes = ""
}) => {
  const initialAmount = Number(openingAmount);

  if (Number.isNaN(initialAmount) || initialAmount < 0) {
    return {
      statusCode: 400,
      payload: {
        ok: false,
        message: "The opening amount must be a number greater than or equal to 0."
      }
    };
  }

  const resolved = await resolveCashRegisterAndEmployee({
    branch,
    cashRegisterId,
    employeeId
  });

  if (!resolved.cashRegisterId) {
    return {
      statusCode: 404,
      payload: {
        ok: false,
        message: `No hay una caja configurada para la sucursal "${branch}".`
      }
    };
  }

  if (!resolved.employeeId) {
    return {
      statusCode: 400,
      payload: {
        ok: false,
        message: "No se encontró el empleado autenticado para abrir la caja."
      }
    };
  }

  if (
    String(resolved.employeeRole).toUpperCase() !== "CAJERO" ||
    !resolved.employeeIsActive
  ) {
    return {
      statusCode: 403,
      payload: {
        ok: false,
        message: "Solo los empleados activos con cargo de cajero pueden abrir la caja."
      }
    };
  }

  if (Number(resolved.employeeBranchId) !== Number(resolved.cashRegisterBranchId)) {
    return {
      statusCode: 403,
      payload: {
        ok: false,
        message: "Solo podés abrir la caja de la sucursal a la que pertenecés."
      }
    };
  }

  const openRow = await findOpenCashSession(
    null,
    resolved.cashRegisterBranchId
  );
  const existingOpen = mapRowToShift(openRow);

  if (existingOpen) {
    return {
      statusCode: 409,
      payload: {
        ok: false,
        message: `There is already an open cash register for "${existingOpen.branch}".`,
        openRegister: existingOpen
      }
    };
  }

  const roundedOpening = roundTwo(initialAmount);
  const createdRow = await insertCashSession({
    cashRegisterId: resolved.cashRegisterId,
    employeeId: resolved.employeeId,
    openingAmount: roundedOpening,
    expectedCash: roundedOpening,
    notes: String(notes || "").trim()
  });

  return {
    statusCode: 201,
    payload: {
      ok: true,
      message: "Cash register opening recorded successfully.",
      data: mapRowToShift(createdRow)
    }
  };
};

const closeShiftService = async ({
  countedCash,
  declaredCard = null,
  declaredDigital = null,
  branch = null,
  employeeId = null,
  notes = ""
}) => {
  const physicalCash = Number(countedCash);

  if (Number.isNaN(physicalCash) || physicalCash < 0) {
    return {
      statusCode: 400,
      payload: {
        ok: false,
        message:
          "The counted cash (countedCash) must be a number greater than or equal to 0."
      }
    };
  }

  const openRow = await findOpenCashSession(branch);
  const openShift = mapRowToShift(openRow);

  if (!openShift) {
    return {
      statusCode: 404,
      payload: {
        ok: false,
        message: "There is no open cash register to close."
      }
    };
  }

  const employee = employeeId ? await findEmployeeById(employeeId) : null;
  if (
    !employee ||
    !employee.is_active ||
    String(employee.role).toUpperCase() !== "CAJERO"
  ) {
    return {
      statusCode: 403,
      payload: {
        ok: false,
        message: "Solo los empleados activos con cargo de cajero pueden cerrar la caja."
      }
    };
  }

  if (Number(employee.branch_id) !== Number(openShift.branchId)) {
    return {
      statusCode: 403,
      payload: {
        ok: false,
        message: "Solo podés cerrar la caja de la sucursal a la que pertenecés."
      }
    };
  }

  const cashSales = roundTwo(openShift.salesByMethod.cash);
  const cardSales = roundTwo(openShift.salesByMethod.card);
  const bitcoinChivoSales = roundTwo(openShift.salesByMethod.bitcoinChivo);

  const expectedCash = roundTwo(openShift.openingAmount + cashSales);
  const roundedCountedCash = roundTwo(physicalCash);
  const difference = roundTwo(roundedCountedCash - expectedCash);

  const closedRow = await closeCashSessionInDb({
    sessionId: openShift.id,
    countedCash: roundedCountedCash,
    declaredCard:
      declaredCard !== null && declaredCard !== undefined
        ? roundTwo(declaredCard)
        : null,
    declaredDigital:
      declaredDigital !== null && declaredDigital !== undefined
        ? roundTwo(declaredDigital)
        : null,
    notes: String(notes || "").trim()
  });

  const closedShift = mapRowToShift(closedRow);
  const totalSales = getTotalSalesAmount(closedShift.salesByMethod);

  return {
    statusCode: 200,
    payload: {
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
    }
  };
};

const getShiftHistoryService = async ({ status = null, branch = null } = {}) => {
  const rows = await findCashSessions({ status, branch });

  const enrichedHistory = rows.map((row) => {
    const shift = mapRowToShift(row);
    const cashSales = roundTwo(shift.salesByMethod.cash);
    const expectedCash = roundTwo(shift.openingAmount + cashSales);
    const totalSales = getTotalSalesAmount(shift.salesByMethod);

    return {
      ...shift,
      expectedCash,
      totalSales
    };
  });

  return {
    statusCode: 200,
    payload: {
      ok: true,
      count: enrichedHistory.length,
      data: enrichedHistory
    }
  };
};

const registerSaleToOpenShift = async ({
  amount,
  paymentMethod,
  branch = null,
  branchId = null
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

  const targetColumn = SALE_COLUMN_BY_METHOD[methodKey];
  if (!targetColumn) {
    return {
      ok: false,
      message: `Unsupported payment method key: ${methodKey}`
    };
  }

  const openRow = branchId
    ? await findOpenCashSession(null, branchId)
    : await findOpenCashSession(branch);
  const openShift = mapRowToShift(openRow);

  if (!openShift) {
    return {
      ok: false,
      message: "There is no open cash register to record the sale."
    };
  }

  const updatedRow = await incrementCashSessionSaleColumn({
    sessionId: openShift.id,
    targetColumn,
    amount: roundTwo(numericAmount)
  });

  return {
    ok: true,
    shift: mapRowToShift(updatedRow)
  };
};

module.exports = {
  openShiftService,
  closeShiftService,
  getShiftHistoryService,
  registerSaleToOpenShift
};