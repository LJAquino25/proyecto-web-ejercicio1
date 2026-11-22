const { orders, billtaxcredit } = require("../data/data-sales-billing.js")

const roundTwo = (value) => Number(Number(value).toFixed(2));

const normalizeInvoiceType = (rawType) => {
    const normalized = String(rawType || "").trim().toLowerCase();
    if (normalized === "factura") return "factura";
    if (["credito-fiscal", "credito_fiscal", "creditofiscal"].includes(normalized)) {
        return "credito-fiscal";
    }
    return null;
};

//Post Api Orders
const postAddOrder = (req, res) => {
    try {
        const {
            IdOrder,
            orderType = "Local",
            customerName,
            orderItems,
            orderDate,
            orderWaiter = "No asignado"
        } = req.body;

        const idOrder = Number(IdOrder);

        if (!Number.isInteger(idOrder) ||
            !Array.isArray(orderItems) ||
            !String(customerName || "").trim() ||
            orderItems.length === 0,
            IdOrder<0) 
            {
            return res.status(400).json({
                message: "Invalid data, please add an item to the order or complete the fields"
            });
        }

        const exists = orders.some(i => i.id === idOrder);
        if (exists) {
            return res.status(409).json({
                message: `There is already an order with the ID ${idOrder}`
            });
        }

        const newOrder = {
            id: idOrder,
            orderType: String(orderType).trim(),
            customerName: String(customerName).trim(),
            orderItems,
            orderDate: orderDate || new Date(),
            orderWaiter: String(orderWaiter).trim(),
        };

        orders.push(newOrder);

        return res.status(201).json(
            {
                message: "Order succesfully done!",
                order: newOrder
            });
    } catch (error) {
        return res.status(500).json({
            message: "Error, order could not be taken",
            error: error.message
        });
    }
};

//Put Api Orders Id
const putOrderUpdate = (req, res) => {
    try {
        const idUpdate = Number(req.params.id);

        if (!Number.isInteger(idUpdate) || idUpdate <= 0) {
            return res.status(400).json({
                message: "The ID on the URL is not valid, try again"
            });
        }

        const {
            orderType,
            customerName,
            orderItems,
            orderDate,
            orderWaiter
        } = req.body

        const searchIndex = orders.findIndex(i => i.id === idUpdate);
        if (searchIndex === -1) {
            return res.status(404).json({
                message: "Order not found try again"
            })
        }

        orders[searchIndex] = {
            id: idUpdate,
            orderType: orderType !== undefined ? String(orderType).trim() : orders[searchIndex].orderType,
            customerName: customerName !== undefined ? String(customerName).trim() : orders[searchIndex].customerName,
            orderItems: Array.isArray(orderItems) ? orderItems : orders[searchIndex].orderItems,
            orderDate: orderDate !== undefined ? orderDate : orders[searchIndex].orderDate,
            orderWaiter: orderWaiter !== undefined ? String(orderWaiter).trim() : orders[searchIndex].orderWaiter,
        }

        return res.status(200).json({
            message: "Order updated successfully!",
            order: orders[searchIndex]
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error, order could not be updated",
            error: error.message
        });
    }
};

//Delete Api Orders Id
const deleteOrders = (req, res) => {
    try {
        const idToDelete = Number(req.params.id);

        if (!Number.isInteger(idToDelete) || idToDelete <= 0) {
            return res.status(400).json({
                message: "The ID on the URL is not valid, try again"
            });
        }

        const index = orders.findIndex(i => i.id === idToDelete);
        if (index === -1) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const deletedOrder = orders.splice(index, 1);

        return res.status(200).json({
            message: "Order deleted successfully!",
            order: deletedOrder[0]
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error, order could not be deleted",
            error: error.message
        });
    }
}

//Get Api Orders
const getlistorders = (req, res) => {
    try {
        return res.status(200).json({
            total: orders.length,
            orders: orders
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving orders",
            error: error.message
        });
    }
}

//Post Api Invoices Type
const postinvoices = (req, res) => {
    try {
        const invoiceType = normalizeInvoiceType(req.params.type);

        if (!invoiceType) {
            return res.status(400).json({
                message: "Invalid invoice type. Use 'factura' or 'credito-fiscal'"
            });
        }

        const {
            idBillTax,
            orderId,
            customerName,
            paymentMethod
        } = req.body;

        const numericBillId = Number(idBillTax);
        const numericOrderId = Number(orderId);

        if (
            !Number.isInteger(numericBillId) ||
            numericBillId <= 0 ||
            !Number.isInteger(numericOrderId) ||
            numericOrderId <= 0 ||
            !String(paymentMethod || "").trim()
        ) {
            return res.status(400).json({
                message: "Missing data or invalid, please try again"
            });
        }

        const order = orders.find(o => o.id === numericOrderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found to generate invoice"
            });
        }

        const items = order.orderItems || [];
        if (items.length === 0) {
            return res.status(400).json({
                message: "The order has no items to bill"
            });
        }

        const rSubtotal = items.reduce(
            (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
            0
        );
        const subtotal = roundTwo(rSubtotal);

        let iva = 0;
        let total = subtotal;

        if (invoiceType === "credito-fiscal") {
            iva = roundTwo(subtotal * 0.13);
            total = roundTwo(subtotal + iva);
        }

        const newBill_Tax = {
            id: numericBillId,
            orderId: order.id,
            type: invoiceType,
            customerName: String(customerName || order.customerName).trim(),
            items,
            subtotal,
            iva,
            total,
            paymentMethod: String(paymentMethod).trim(),
            date: new Date()
        };

        billtaxcredit.push(newBill_Tax);

        return res.status(201).json({
            message: `${invoiceType} created successfully!`,
            invoice: newBill_Tax
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error, bill or credit tax could not be created",
            error: error.message
        });
    }
};


//Get Api Invoices
const getlistBillandtaxcredit = (req, res) => {
    try {
        const { type } = req.query;
        let billtax = billtaxcredit;

        if (type) {
            const normalizedType = normalizeInvoiceType(type) ||
                String(type).trim().toLowerCase();
            billtax = billtaxcredit.filter(inv => inv.type === normalizedType);
        }

        return res.status(200).json({
            total: billtax.length,
            invoices: billtax
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
}