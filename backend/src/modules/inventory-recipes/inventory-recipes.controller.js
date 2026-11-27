const inventoryRecipesService = require("./inventory-recipes.service.js");

const resolveBranchId = (req, requestedBranchId) => {
  const isManager = String(req.user?.role || "").toUpperCase() === "GERENTE";
  const employeeBranchId = Number(req.user?.branchId);

  if (!isManager) {
    if (!Number.isInteger(employeeBranchId) || employeeBranchId <= 0) {
      const error = new Error("La sesión no tiene una sucursal asignada");
      error.statusCode = 403;
      throw error;
    }

    if (
      requestedBranchId !== undefined &&
      requestedBranchId !== null &&
      requestedBranchId !== "" &&
      Number(requestedBranchId) !== employeeBranchId
    ) {
      const error = new Error("No tenés acceso al inventario de esa sucursal");
      error.statusCode = 403;
      throw error;
    }

    return employeeBranchId;
  }

  const branchId = Number(requestedBranchId);
  if (!Number.isInteger(branchId) || branchId <= 0) {
    const error = new Error("Seleccioná una sucursal válida");
    error.statusCode = 400;
    throw error;
  }
  return branchId;
};

const addProducts = async (req, res) => {
  try {
    const result = await inventoryRecipesService.addProductToInventory({
      branchId: resolveBranchId(req, req.body.branch_id),
      supplierId: req.body.supplier_id,
      employeeId: req.user.id,
      name: req.body.name,
      unit: req.body.unit,
      quantity: req.body.quantity,
      minStock: req.body.min_stock,
    });

    return res.status(201).json({
      message: "supply successfully updated",
      ...result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error adding supply",
    });
  }
};

const listProducts = async (req, res) => {
  try {
    const branchId = resolveBranchId(req, req.query.branch_id);
    const products = await inventoryRecipesService.listProducts(branchId);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error getting inventory",
    });
  }
};

const listSupplies = async (req, res) => {
  try {
    const supplies = await inventoryRecipesService.listSupplies();
    return res.status(200).json(supplies);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error getting supplies",
    });
  }
};

const listAvailableSupplies = async (req, res) => {
  try {
    if (String(req.user?.role || "").toUpperCase() === "GERENTE") {
      return res.status(200).json(await inventoryRecipesService.listSupplies());
    }
    const branchId = resolveBranchId(req, undefined);
    const supplies = await inventoryRecipesService.listAvailableSupplies(branchId);
    return res.status(200).json(supplies);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error getting available supplies",
    });
  }
};

const addRecipes = async (req, res) => {
  try {
    const isManager = String(req.user?.role || "").toUpperCase() === "GERENTE";
    const result = await inventoryRecipesService.addRecipe({
      productId: req.body.product_id,
      name: req.body.name,
      description: req.body.description,
      ingredients: req.body.ingredients,
      branchId: isManager ? null : resolveBranchId(req, undefined),
    });

    return res.status(201).json({
      message: "Recipe successfully created",
      ...result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error creating recipe",
    });
  }
};

const editRecipe = async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();

    if (!["GERENTE", "COCINERO"].includes(role)) {
      return res.status(403).json({
        message: "No tenés permisos para editar recetas",
      });
    }

    const result = await inventoryRecipesService.updateRecipe({
      recipeId: Number(req.params.id),
      ingredients: req.body.ingredients,
      branchId: role === "GERENTE"
        ? null
        : resolveBranchId(req, undefined),
    });

    return res.status(200).json({
      message: "Receta actualizada correctamente",
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Error al actualizar la receta",
    });
  }
};

const listRecipes = async (req, res) => {
  try {
    const recipes = await inventoryRecipesService.listRecipes();
    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting recipes",
    });
  }
};

const listMenu = async (req, res) => {
  try {
    const menu = await inventoryRecipesService.listMenu();
    return res.status(200).json(menu);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting menu",
    });
  }
};

const alertStock = async (req, res) => {
  try {
    const branchId = resolveBranchId(req, req.query.branch_id);
    const alerts = await inventoryRecipesService.getStockAlerts(branchId);
    return res.status(200).json(alerts);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error verifiying stock",
    });
  }
};

const prepareRecipe = async (req, res) => {
  try {
    const result = await inventoryRecipesService.prepareRecipe({
      recipeId: req.body.id,
      recipeQuantity: req.body.quantity,
      branchId: resolveBranchId(req, req.body.branch_id),
      employeeId: req.user.id,
    });

    return res.status(200).json({
      message: "Recipe successfully prepared",
      alerts: result.alerts,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error preparing recipe",
    });
  }
};

const addCatalog = async (req, res) => {
  try {
    const isManager = String(req.user?.role || "").toUpperCase() === "GERENTE";
    const productType = req.body.productType || "PREPARED";
    if (!isManager && String(productType).toUpperCase() !== "PREPARED") {
      return res.status(403).json({
        message: "El personal de cocina solo puede crear productos preparados",
      });
    }

    const result = await inventoryRecipesService.addCatalog({
      name: req.body.name,
      price: Number(req.body.price),
      productType,
      supplierId:
        req.body.supplierId !== undefined ? Number(req.body.supplierId) : null,
      unitCost:
        req.body.unitCost !== undefined ? Number(req.body.unitCost) : null,
      ingredients: req.body.ingredients,
      branchId: isManager ? null : resolveBranchId(req, undefined),
    });
    return res.status(201).json({
      message: "Product successfully added",
      ...result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || "Error adding product",
    });
  }
};

const listCatalogDetails = async (req, res) => {
  try {
    const products = await inventoryRecipesService.listCatalogDetails();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting catalog details",
    });
  }
};

const listPackagedInventory = async (req, res) => {
  try {
    const branchId = resolveBranchId(req, req.query.branch_id);
    const products = await inventoryRecipesService.listPackagedInventory(branchId);

    return res.status(200).json(products);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error getting packaged inventory",
    });
  }
};

const editCatalog = async (req, res) => {
  try {
    const product = await inventoryRecipesService.updateCatalog({
      id: Number(req.params.id),
      name: req.body.name,
      price: Number(req.body.price),
      supplierId: Number(req.body.supplierId),
      unitCost: Number(req.body.unitCost),
    });
    return res.status(200).json({ message: "Producto actualizado", product });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Error al actualizar el producto",
    });
  }
};

module.exports = {
  editCatalog,
  addProducts,
  listProducts,
  listSupplies,
  listAvailableSupplies,
  addRecipes,
  listRecipes,
  listMenu,
  alertStock,
  prepareRecipe,
  addCatalog,
  listCatalogDetails,
  listPackagedInventory,
  editRecipe,
};
