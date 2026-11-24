const {
    getAllOrdersFromDB,
    createOrderInDb,
    updateOrderInDb,
    deleteOrderInDb,
    createInvoiceInDb,
    getInvoicesFromDb
} = require("./sales-billing.services.js");

const normalizeInvoiceType = (rawType) => {
    const normalized = String(rawType || "").trim().toLowerCase();
    if (normalized === "factura" || normalized === "normal") return "NORMAL";
    if (
        ["credito-fiscal", "credito_fiscal", "creditofiscal", "tax_credit"].includes(
            normalized
        )
    ) {
        return "TAX_CREDIT";
    }
    return null;
};

const normalizePaymentMethod = (rawMethod) => {
    const normalized = String(rawMethod || "").trim().toUpperCase();
    const validMethods = ["CASH", "CARD", "BITCOIN", "CHIVO_WALLET", "TRANSFER"];
    return validMethods.includes(normalized) ? normalized : null;
};

const validOrderStatuses = [
    "CART",
    "PAID",
    "IN_PREPARATION",
    "DELIVERED",
    "CANCELLED"
];

const parseOptionalPositiveInt = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return Number.isInteger(num) && num > 0 ? num : NaN;
};

const normalizeOrderItems = (orderItems) => {
    const normalized = [];
    for (const item of orderItems) {
        const product_id = Number(item.product_id ?? item.productId);
        const quantity = Number(item.quantity);
        if (
            !Number.isInteger(product_id) ||
            product_id <= 0 ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return null;
        }
        normalized.push({ product_id, quantity });
    }
    return normalized;
};

//Post Api Orders
const postAddOrder = async (req, res) => {
    try {
        const {
            branch_id,
            customer_id = null,
            employee_id = null,
            invoice_type = "NORMAL",
            status = "CART",
            orderItems
        } = req.body;

        const branchId = Number(branch_id);
        const customerId = parseOptionalPositiveInt(customer_id);
        const employeeId = parseOptionalPositiveInt(employee_id);
        const invoiceType = normalizeInvoiceType(invoice_type);
        const orderStatus = String(status || "").trim().toUpperCase();
        const normalizedItems = Array.isArray(orderItems)
            ? normalizeOrderItems(orderItems)
            : null;

        if (
            !Number.isInteger(branchId) ||
            branchId <= 0 ||
            Number.isNaN(customerId) ||
            Number.isNaN(employeeId) ||
            !invoiceType ||
            !validOrderStatuses.includes(orderStatus) ||
            !normalizedItems ||
            normalizedItems.length === 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid data."
            });
        }

        const order = await createOrderInDb({
            branchId,
            customerId,
            employeeId,
            invoiceType,
            status: orderStatus,
            orderItems: normalizedItems
        });

        return res.status(201).json({
            message: "Order successfully created!",
            order
        });
    } catch (error) {
        if (error.code === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({ message: error.message });
        }
        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid branch_id, customer_id, or employee_id"
            });
        }
        return res.status(500).json({
            message: "Error, order could not be created",
            error: error.message
        });
    }
};

//Put Api Orders Id
const putOrderUpdate = async (req, res) => {
    try {
        const {
            orderId,
            branch_id,
            customer_id,
            employee_id,
            invoice_type,
            status,
            orderItems
        } = req.body;

        const numberOrderId = Number(orderId);
        const branchId =
            branch_id !== undefined ? Number(branch_id) : undefined;
        const customerId =
            customer_id !== undefined ? parseOptionalPositiveInt(customer_id) : undefined;
        const employeeId =
            employee_id !== undefined ? parseOptionalPositiveInt(employee_id) : undefined;
        const invoiceType =
            invoice_type !== undefined ? normalizeInvoiceType(invoice_type) : undefined;
        const orderStatus =
            status !== undefined ? String(status).trim().toUpperCase() : undefined;

        if (!Number.isInteger(numberOrderId) || numberOrderId <= 0) {
        return res.status(400).json({
        message: "The ID is not valid, please try again"
        });
        }

        if (
            (branchId !== undefined && (!Number.isInteger(branchId) || branchId <= 0)) ||
            Number.isNaN(customerId) ||
            Number.isNaN(employeeId) ||
            (invoice_type !== undefined && !invoiceType) ||
            (orderStatus !== undefined && !validOrderStatuses.includes(orderStatus))
        ) {
            return res.status(400).json({
                message: "Invalid fields"
            });
        }

        let normalizedItems;
        if (orderItems !== undefined) {
            if (!Array.isArray(orderItems) || orderItems.length === 0) {
                return res.status(400).json({
                    message: "orderItems must have data"
                });
            }
            normalizedItems = normalizeOrderItems(orderItems);
            if (!normalizedItems) {
                return res.status(400).json({
                    message:
                        "Each order item must have valid and positive product_id and quantity"
                });
            }
        }

        const updatedOrder = await updateOrderInDb(numberOrderId, {
            branchId,
            customerId,
            employeeId,
            invoiceType,
            status: orderStatus,
            orderItems: normalizedItems
        });

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found, try again"
            });
        }

        return res.status(200).json({
            message: "Order updated successfully!",
            order: updatedOrder
        });
    } catch (error) {
        if (error.code === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({ message: error.message });
        }
        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid branch_id, customer_id, or employee_id"
            });
        }
        return res.status(500).json({
            message: "Error, order could not be updated",
            error: error.message
        });
    }
};

//Delete Api Orders Id
const deleteOrders = async (req, res) => {
    try {
        const {orderId} = req.body;
        const idToDelete = Number(orderId);
        if (!Number.isInteger(idToDelete) || idToDelete <= 0) {
            return res.status(400).json({
                message: "The ID to delete is not valid, please try again"
            });
        }

        const deleted = await deleteOrderInDb(idToDelete);
        if (!deleted) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            message: "Order deleted successfully!",
            order: deleted
        });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                message:
                    "Cannot delete order because it has associated invoices or payments. Cancel it instead."
            });
        }
        return res.status(500).json({
            message: "Error, order could not be deleted",
            error: error.message
        });
    }
};

//Get Api Orders
const getlistorders = async (req, res) => {
    try {
        const orders = await getAllOrdersFromDB();
        return res.status(200).json({
            total: orders.length,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving orders",
            error: error.message
        });
    }
};

//Post Api Invoices Type
const postinvoices = async (req, res) => {
    try {
        const invoiceType = normalizeInvoiceType(req.body.type);

        if (!invoiceType) {
            return res.status(400).json({
                message: "Invalid invoice type. Use 'factura' or 'credito-fiscal'"
            });
        }

        const {
            orderId,
            paymentMethod,
            cash_session_id = null,
            gateway_reference = null,
            nit,
            nrc,
            institution_name,
            business_line = null,
            address = null
        } = req.body;

        const numericOrderId = Number(orderId);
        const paymentEnum = paymentMethod ? normalizePaymentMethod(paymentMethod) : null;
        const cashSessionId = parseOptionalPositiveInt(cash_session_id);

        if (!Number.isInteger(numericOrderId) || numericOrderId <= 0) {
            return res.status(400).json({
                message: "Invalid or missing orderId"
            });
        }

        if (Number.isNaN(cashSessionId)) {
            return res.status(400).json({
                message: "Invalid cash_session_id"
            });
        }

        if (paymentMethod && !paymentEnum) {
            return res.status(400).json({
                message:
                    "Invalid payment method. Allowed: CASH, CARD, BITCOIN, CHIVO_WALLET, TRANSFER"
            });
        }

        if (
            invoiceType === "TAX_CREDIT" &&
            (!String(nit || "").trim() ||
                !String(nrc || "").trim() ||
                !String(institution_name || "").trim())
        ) {
            return res.status(400).json({
                message:
                    "For credito-fiscal, nit, nrc, and institution_name are required"
            });
        }

        const result = await createInvoiceInDb({
            orderId: numericOrderId,
            invoiceType,
            paymentMethod: paymentEnum || "CASH",
            cashSessionId,
            gatewayReference: gateway_reference,
            nit: nit ? String(nit).trim() : null,
            nrc: nrc ? String(nrc).trim() : null,
            institutionName: institution_name ? String(institution_name).trim() : null,
            businessLine: business_line ? String(business_line).trim() : null,
            address: address ? String(address).trim() : null
        });

        if (result?.notFound) {
            return res.status(404).json({
                message: "Order not found to generate invoice"
            });
        }

        if (result?.emptyOrder) {
            return res.status(400).json({
                message: "The order has no items to bill"
            });
        }

        return res.status(201).json({
            message: `${req.body.type} created successfully!`,
            invoiceType,
            ...result
        });
    } catch (error) {
        if (error.code === "NO_OPEN_CASH_SESSION") {
            return res.status(409).json({
                message: "No hay un turno de caja abierto"
            });
        }
        if (error.code === "23505") {
            return res.status(409).json({
                message:
                    "An invoice or tax credit note has already been done for this order"
            });
        }
        return res.status(500).json({
            message: "Error, bill or credit tax could not be created",
            error: error.message
        });
    }
};

//Get Api Invoices
const getlistBillandtaxcredit = async (req, res) => {
    try {
        const { type } = req.query;
        const filterType = type
            ? normalizeInvoiceType(type) || String(type).trim().toUpperCase()
            : null;

        const invoices = await getInvoicesFromDb(filterType);

        return res.status(200).json({
            total: invoices.length,
            invoices
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving bills or tax credits",
            error: error.message
        });
    }
};

module.exports = {
    getlistorders,
    getlistBillandtaxcredit,
    postAddOrder,
    postinvoices,
    deleteOrders,
    putOrderUpdate
};