const pool = require("../../config/config.js");
const salesBillingRepo = require("./sales-billing.repo.js");
const { registerSaleToOpenShift } = require("../cash-register/cash-register.services.js");

const roundTwo = (value) => Number(Number(value).toFixed(2));

const calculateOrderAmounts = (items) => {
    const rawTotal = items.reduce(
        (acc, item) => acc + Number(item.unit_price) * Number(item.quantity),
        0
    );
    const total = roundTwo(rawTotal);
    const tax = roundTwo((total * 13) / 113);
    const subtotal = roundTwo(total - tax);

    return { subtotal, tax, total };
};

const mapRowToOrder = (row) => {
    if (!row) return null;

    return {
        id: row.id,
        branchId: row.branch_id,
        customerId: row.customer_id,
        employeeId: row.employee_id,
        invoiceType: row.invoice_type,
        status: row.status,
        createdAt: row.created_at,
        subtotal: roundTwo(row.subtotal),
        tax: roundTwo(row.tax),
        total: roundTwo(row.total),
        items: Array.isArray(row.items)
            ? row.items.map((item) => ({
                productId: item.product_id,
                productName: item.product_name,
                quantity: Number(item.quantity),
                unitPrice: roundTwo(item.unit_price)
            }))
            : []
    };
};

const mapRowToInvoice = (row) => {
    if (!row) return null;
    return {
        documentType: row.document_type,
        documentNumber: row.document_number,
        issuedAt: row.issued_at,
        orderId: row.order_id,
        branchId: row.branch_id,
        customerId: row.customer_id,
        orderStatus: row.order_status,
        subtotal: roundTwo(row.subtotal),
        tax: roundTwo(row.tax),
        total: roundTwo(row.total),
        taxCreditData:
            row.document_type === "TAX_CREDIT"
                ? {
                    nit: row.nit,
                    nrc: row.nrc,
                    institutionName: row.institution_name
                }
                : null
    };
};

//Get all orders
const getAllOrdersFromDB = async () => {
    const rows = await salesBillingRepo.getAllOrders();
    return rows.map(mapRowToOrder);
};

const getOrdersByIdFromDB = async (orderId, db = pool) => {
    const row = await salesBillingRepo.getOrderById(orderId, db);
    return mapRowToOrder(row);
};

//Create orders
const createOrderInDb = async ({
    branchId,
    customerId = null,
    employeeId = null,
    invoiceType = "NORMAL",
    status = "CART",
    orderItems
}) => {
    const client = await pool.connect();

    try {
        const mergedItemsMap = new Map();
        for (const item of orderItems) {
            const productId = Number(item.product_id ?? item.productId);
            const quantity = Number(item.quantity);
            mergedItemsMap.set(productId, (mergedItemsMap.get(productId) || 0) + quantity);
        }

        const productIds = Array.from(mergedItemsMap.keys());

        await client.query("BEGIN");

        const products = await salesBillingRepo.findProductsByIds(productIds, client);

        if (products.length !== productIds.length) {
            const err = new Error("One or more products were not found in menu");
            err.code = "PRODUCT_NOT_FOUND";
            throw err;
        }

        const productMap = new Map(products.map((p) => [p.id, p]));
        const pricedItems = productIds.map((productId) => {
            const prod = productMap.get(productId);
            return {
                product_id: productId,
                product_name: prod.name,
                quantity: mergedItemsMap.get(productId),
                unit_price: roundTwo(prod.price)
            };
        });

        const { subtotal, tax, total } = calculateOrderAmounts(pricedItems);

        const createdOrder = await salesBillingRepo.insertOrder(
            { branchId, customerId, employeeId, invoiceType, status, subtotal, tax, total },
            client
        );

        const createdOrderId = createdOrder.id;

        for (const item of pricedItems) {
            await salesBillingRepo.insertOrderDetail(
                {
                    orderId: createdOrderId,
                    productId: item.product_id,
                    quantity: item.quantity,
                    unitPrice: item.unit_price
                },
                client
            );
        }

        const fullRow = await salesBillingRepo.getOrderById(createdOrderId, client);

        await client.query("COMMIT");

        return mapRowToOrder(fullRow);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

//Update orders
const updateOrderInDb = async (
    orderId,
    { branchId, customerId, employeeId, invoiceType, status, orderItems }
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existingRows = await salesBillingRepo.findOrderRowById(orderId, client);

        if (existingRows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        const currentOrder = existingRows[0];

        const nextBranchId = branchId !== undefined ? branchId : currentOrder.branch_id;
        const nextCustomerId = customerId !== undefined ? customerId : currentOrder.customer_id;
        const nextEmployeeId = employeeId !== undefined ? employeeId : currentOrder.employee_id;
        const nextInvoiceType = invoiceType !== undefined ? invoiceType : currentOrder.invoice_type;
        const nextStatus = status !== undefined ? status : currentOrder.status;

        let itemsForCalc;

        if (Array.isArray(orderItems)) {
            const mergedMap = new Map();
            for (const item of orderItems) {
                const productId = Number(item.product_id ?? item.productId);
                const quantity = Number(item.quantity);
                mergedMap.set(productId, (mergedMap.get(productId) || 0) + quantity);
            }

            const productIds = Array.from(mergedMap.keys());
            const products = await salesBillingRepo.findProductsByIds(productIds, client);

            if (products.length !== productIds.length) {
                const err = new Error("One or more products were not found in catalog");
                err.code = "PRODUCT_NOT_FOUND";
                throw err;
            }

            const priceMap = new Map(products.map((p) => [p.id, roundTwo(p.price)]));
            itemsForCalc = productIds.map((productId) => ({
                product_id: productId,
                quantity: mergedMap.get(productId),
                unit_price: priceMap.get(productId)
            }));

            await salesBillingRepo.deleteOrderDetailsByOrderId(orderId, client);
            for (const item of itemsForCalc) {
                await salesBillingRepo.insertOrderDetail(
                    {
                        orderId,
                        productId: item.product_id,
                        quantity: item.quantity,
                        unitPrice: item.unit_price
                    },
                    client
                );
            }
        } else {
            itemsForCalc = await salesBillingRepo.getOrderDetailsByOrderId(orderId, client);
        }

        const { subtotal, tax, total } = calculateOrderAmounts(itemsForCalc);

        await salesBillingRepo.updateOrder(
            {
                orderId,
                branchId: nextBranchId,
                customerId: nextCustomerId,
                employeeId: nextEmployeeId,
                invoiceType: nextInvoiceType,
                status: nextStatus,
                subtotal,
                tax,
                total
            },
            client
        );

        await client.query("COMMIT");

        return await getOrdersByIdFromDB(orderId);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

//delete orders
const deleteOrderInDb = async (orderId) => {
    return await salesBillingRepo.deleteOrder(orderId);
};

const createInvoiceInDb = async ({
    orderId,
    invoiceType,
    paymentMethod = null,
    cashSessionId = null,
    gatewayReference = null,
    nit = null,
    nrc = null,
    institutionName = null,
    businessLine = null,
    address = null
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const orderRows = await salesBillingRepo.findOrderRowById(orderId, client);

        if (orderRows.length === 0) {
            await client.query("ROLLBACK");
            return { notFound: true };
        }

        const detailRows = await salesBillingRepo.getOrderDetailsWithProductName(orderId, client);

        if (detailRows.length === 0) {
            await client.query("ROLLBACK");
            return { emptyOrder: true };
        }

        const { subtotal, tax, total } = calculateOrderAmounts(detailRows);
        const isCashPayment = paymentMethod === "CASH";

        let resolvedCashSessionId = cashSessionId;
        let cashIntegration = null;

        if (isCashPayment) {
            cashIntegration = await registerSaleToOpenShift({
                amount: total,
                paymentMethod
            });

            if (!cashIntegration.ok) {
                await client.query("ROLLBACK");
                const err = new Error("No hay un turno de caja abierto");
                err.code = "NO_OPEN_CASH_SESSION";
                throw err;
            }

            if (!resolvedCashSessionId && cashIntegration.shift?.id) {
                resolvedCashSessionId = cashIntegration.shift.id;
            }
        } else if (paymentMethod) {
            cashIntegration = await registerSaleToOpenShift({
                amount: total,
                paymentMethod
            });

            if (cashIntegration.ok && !resolvedCashSessionId && cashIntegration.shift?.id) {
                resolvedCashSessionId = cashIntegration.shift.id;
            }
        }

        const nextOrderStatus = paymentMethod ? "PAID" : orderRows[0].status;

        const updatedOrder = await salesBillingRepo.updateOrderBilling(
            { orderId, invoiceType, subtotal, tax, total, status: nextOrderStatus },
            client
        );

        let documentRecord;

        if (invoiceType === "NORMAL") {
            documentRecord = await salesBillingRepo.insertInvoice(orderId, client);
        } else {
            documentRecord = await salesBillingRepo.insertTaxCreditNote(
                { orderId, nit, nrc, institutionName, businessLine, address },
                client
            );
        }

        let paymentRecord = null;
        if (paymentMethod) {
            paymentRecord = await salesBillingRepo.insertPayment(
                {
                    orderId,
                    cashSessionId: resolvedCashSessionId,
                    method: paymentMethod,
                    gatewayReference,
                    amount: total
                },
                client
            );
        }

        await client.query("COMMIT");

        return {
            order: updatedOrder,
            document: documentRecord,
            payment: paymentRecord,
            items: detailRows,
            cashRegister: cashIntegration?.ok
                ? { updated: true, shiftId: cashIntegration.shift.id }
                : { updated: false }
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getInvoicesFromDb = async (filterType = null) => {
    const rows = await salesBillingRepo.getInvoices(filterType);
    return rows.map(mapRowToInvoice);
};

module.exports = {
    getAllOrdersFromDB,
    getOrdersByIdFromDB,
    createOrderInDb,
    updateOrderInDb,
    deleteOrderInDb,
    createInvoiceInDb,
    getInvoicesFromDb
};