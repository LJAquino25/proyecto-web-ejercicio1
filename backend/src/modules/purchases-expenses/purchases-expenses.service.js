const pool = require("../../config/config.js");
const purchasesExpensesRepo = require("./purchases-expenses.repo.js");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const roundTwo = (value) => Number(Number(value).toFixed(2));
const VALID_EXPENSE_CATEGORIES = ["BASIC_SERVICES", "RENT", "NET_SALARY"];

const preparePurchaseItemsAndTotals = async (items, supplierId, client) => {
  const preparedItems = [];

  for (const rawItem of items) {
    const quantity = Number(rawItem.quantity);
    const unitCost = Number(rawItem.unitCost ?? rawItem.unit_cost);
    const itemName = String(rawItem.name || "").trim();
    const packagedProductId =
      rawItem.packagedProductId || rawItem.packaged_product_id
        ? Number(rawItem.packagedProductId || rawItem.packaged_product_id)
        : null;
    let supplyId =
      rawItem.supplyId || rawItem.supply_id
        ? Number(rawItem.supplyId || rawItem.supply_id)
        : null;

    if (
      Number.isNaN(quantity) ||
      quantity <= 0 ||
      Number.isNaN(unitCost) ||
      unitCost < 0 ||
      (!supplyId && !packagedProductId && !itemName)
    ) {
      throw createHttpError(
        400,
        "Each item must include valid quantity > 0, unitCost >= 0, and supply/product info"
      );
    }

    if (!packagedProductId && !supplyId) {
      let supply = await purchasesExpensesRepo.findSupplyByName(itemName, client);
      if (!supply) {
        supply = await purchasesExpensesRepo.createSupply(
          {
            supplierId,
            name: itemName,
            unit: rawItem.unit || "UNIT"
          },
          client
        );
      }
      supplyId = supply.id;
    }

    preparedItems.push({
      supplyId,
      packagedProductId,
      quantity,
      unitCost: roundTwo(unitCost),
      lineSubtotal: roundTwo(quantity * unitCost)
    });
  }

  const subtotal = roundTwo(
    preparedItems.reduce((acc, item) => acc + item.lineSubtotal, 0)
  );
  const tax = roundTwo(subtotal * 0.13);
  const total = roundTwo(subtotal + tax);

  return { preparedItems, subtotal, tax, total };
};


// SUPPLIERS

const addSupplier = async ({ name, phone = null }) => {
  const cleanName = String(name || "").trim();
  if (!cleanName) {
    throw createHttpError(400, "Supplier name is required");
  }

  const existing = await purchasesExpensesRepo.findSupplierByName(cleanName);
  if (existing) {
    throw createHttpError(409, `Supplier '${cleanName}' already exists`);
  }

  return await purchasesExpensesRepo.createSupplier({
    name: cleanName,
    phone: phone ? String(phone).trim() : null
  });
};

const listSuppliers = async () => {
  return await purchasesExpensesRepo.getAllSuppliers();
};


// PURCHASE ORDERS

const addPurchaseOrder = async ({
  supplierId,
  branchId = 1,
  employeeId = 1,
  items,
  expectedDate = null
}) => {
  const parsedSupplierId = Number(supplierId);
  if (
    !Number.isInteger(parsedSupplierId) ||
    parsedSupplierId <= 0 ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw createHttpError(
      400,
      "supplierId and a non-empty items array are required"
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const supplier = await purchasesExpensesRepo.findSupplierById(
      parsedSupplierId,
      client
    );
    if (!supplier) {
      throw createHttpError(404, `Supplier with ID ${parsedSupplierId} not found`);
    }

    const { preparedItems, subtotal, tax, total } =
      await preparePurchaseItemsAndTotals(items, parsedSupplierId, client);

    const orderDocNum = `ORD-${Date.now()}`;

    const purchaseOrder = await purchasesExpensesRepo.createPurchase(
      {
        branchId: Number(branchId) || 1,
        supplierId: parsedSupplierId,
        employeeId: Number(employeeId) || 1,
        documentNum: orderDocNum,
        paymentTerms: "CASH",
        status: "RECORDED",
        issueDate: null,
        dueDate: expectedDate || null,
        subtotal,
        tax,
        total
      },
      client
    );

    const savedDetails = [];
    for (const item of preparedItems) {
      const detail = await purchasesExpensesRepo.createPurchaseDetail(
        {
          purchaseId: purchaseOrder.id,
          supplyId: item.supplyId,
          packagedProductId: item.packagedProductId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          lineSubtotal: item.lineSubtotal
        },
        client
      );
      savedDetails.push(detail);
    }

    await client.query("COMMIT");

    return {
      ...purchaseOrder,
      supplier_name: supplier.name,
      order_status: "PENDING",
      items: savedDetails
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const listPurchaseOrders = async (statusFilter = null) => {
  const orders = await purchasesExpensesRepo.getPurchaseOrders();
  if (!statusFilter) return orders;

  const normalized = String(statusFilter).trim().toUpperCase();
  return orders.filter((o) => o.order_status === normalized);
};

// PURCHASE INVOICES 

const addPurchaseInvoice = async ({
  purchaseOrderId = null,
  supplierId,
  branchId = 1,
  employeeId = 1,
  documentNum,
  paymentTerms = "CASH",
  issueDate = null,
  dueDate = null,
  items
}) => {
  const parsedSupplierId = Number(supplierId);
  const parsedBranchId = Number(branchId) || 1;
  const parsedEmployeeId = Number(employeeId) || 1;
  const cleanDocNum = String(documentNum || "").trim();
  const normalizedTerms = String(paymentTerms).trim().toUpperCase();

  if (
    !Number.isInteger(parsedSupplierId) ||
    parsedSupplierId <= 0 ||
    !cleanDocNum ||
    !["CASH", "CREDIT"].includes(normalizedTerms) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw createHttpError(
      400,
      "supplierId, documentNum, paymentTerms (CASH/CREDIT), and items are required"
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const supplier = await purchasesExpensesRepo.findSupplierById(
      parsedSupplierId,
      client
    );
    if (!supplier) {
      throw createHttpError(404, `Supplier with ID ${parsedSupplierId} not found`);
    }

    const { preparedItems, subtotal, tax, total } =
      await preparePurchaseItemsAndTotals(items, parsedSupplierId, client);

    let invoiceRecord;
    if (purchaseOrderId) {
      const parsedOrderId = Number(purchaseOrderId);
      invoiceRecord = await purchasesExpensesRepo.updatePurchaseOrderToInvoice(
        {
          purchaseOrderId: parsedOrderId,
          documentNum: cleanDocNum,
          paymentTerms: normalizedTerms,
          issueDate,
          dueDate: normalizedTerms === "CREDIT" ? dueDate : null,
          subtotal,
          tax,
          total
        },
        client
      );
      if (!invoiceRecord) {
        throw createHttpError(404, `Purchase order with ID ${parsedOrderId} not found`);
      }
      await purchasesExpensesRepo.deletePurchaseDetailsByPurchaseId(
        parsedOrderId,
        client
      );
    } else {
      invoiceRecord = await purchasesExpensesRepo.createPurchase(
        {
          branchId: parsedBranchId,
          supplierId: parsedSupplierId,
          employeeId: parsedEmployeeId,
          documentNum: cleanDocNum,
          paymentTerms: normalizedTerms,
          status: "RECORDED",
          issueDate,
          dueDate: normalizedTerms === "CREDIT" ? dueDate : null,
          subtotal,
          tax,
          total
        },
        client
      );
    }

    const savedDetails = [];
    for (const item of preparedItems) {
      const detail = await purchasesExpensesRepo.createPurchaseDetail(
        {
          purchaseId: invoiceRecord.id,
          supplyId: item.supplyId,
          packagedProductId: item.packagedProductId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          lineSubtotal: item.lineSubtotal
        },
        client
      );
      savedDetails.push(detail);

      if (item.supplyId) {
        await purchasesExpensesRepo.upsertBranchSupplyInventory(
          {
            branchId: parsedBranchId,
            supplyId: item.supplyId,
            quantity: item.quantity
          },
          client
        );

        await purchasesExpensesRepo.createInventoryMovement(
          {
            branchId: parsedBranchId,
            employeeId: parsedEmployeeId,
            supplyId: item.supplyId,
            movementType: "IN",
            quantity: item.quantity
          },
          client
        );
      } else if (item.packagedProductId) {
        await purchasesExpensesRepo.upsertBranchPackagedInventory(
          {
            branchId: parsedBranchId,
            productId: item.packagedProductId,
            stock: Math.round(item.quantity)
          },
          client
        );

        await purchasesExpensesRepo.createInventoryMovement(
          {
            branchId: parsedBranchId,
            employeeId: parsedEmployeeId,
            productId: item.packagedProductId,
            movementType: "IN",
            quantity: item.quantity
          },
          client
        );
      }
    }

    let accountPayable = null;
    if (normalizedTerms === "CREDIT") {
      accountPayable = await purchasesExpensesRepo.createAccountPayable(
        {
          purchaseId: invoiceRecord.id,
          supplierId: parsedSupplierId,
          totalAmount: total,
          pendingBalance: total,
          dueDate: dueDate || null
        },
        client
      );
    }

    await client.query("COMMIT");

    return {
      ...invoiceRecord,
      supplier_name: supplier.name,
      items: savedDetails,
      account_payable: accountPayable
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


// GENERAL EXPENSES

const addExpense = async ({
  branchId = 1,
  employeeId = 1,
  category,
  description,
  amount,
  reference = null
}) => {
  const normalizedCategory = String(category || "").trim().toUpperCase();
  const cleanDescription = String(description || "").trim();
  const parsedAmount = Number(amount);

  if (!VALID_EXPENSE_CATEGORIES.includes(normalizedCategory)) {
    throw createHttpError(
      400,
      `Invalid category. Use one of: ${VALID_EXPENSE_CATEGORIES.join(", ")}`
    );
  }

  if (!cleanDescription || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    throw createHttpError(400, "Valid description and amount > 0 are required");
  }

  return await purchasesExpensesRepo.createGeneralExpense({
    branchId: Number(branchId) || 1,
    employeeId: Number(employeeId) || 1,
    category: normalizedCategory,
    description: cleanDescription,
    amount: roundTwo(parsedAmount),
    reference: reference ? String(reference).trim() : null
  });
};

const listExpenses = async (category = null) => {
  const normalizedCategory = category
    ? String(category).trim().toUpperCase()
    : null;

  if (
    normalizedCategory &&
    !VALID_EXPENSE_CATEGORIES.includes(normalizedCategory)
  ) {
    throw createHttpError(
      400,
      `Invalid category. Use one of: ${VALID_EXPENSE_CATEGORIES.join(", ")}`
    );
  }

  const expenses = await purchasesExpensesRepo.getGeneralExpenses({
    category: normalizedCategory
  });

  const totalAmount = roundTwo(
    expenses.reduce((acc, item) => acc + Number(item.amount), 0)
  );

  return {
    total: expenses.length,
    totalAmount,
    expenses
  };
};

module.exports = {
  addSupplier,
  listSuppliers,
  addPurchaseOrder,
  listPurchaseOrders,
  addPurchaseInvoice,
  addExpense,
  listExpenses
};