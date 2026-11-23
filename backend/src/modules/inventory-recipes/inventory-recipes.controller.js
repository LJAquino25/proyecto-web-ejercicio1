const inventoryRecipesService = require("./inventory-recipes.service.js");

const addProducts = async (req, res) => {
  try {
    const result = await inventoryRecipesService.addProductToInventory({
      branchId: Number(req.body.branch_id) || 1,
      supplierId: Number(req.body.supplier_id) || 1,
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
    const branchId = Number(req.query.branch_id) || 1;
    const products = await inventoryRecipesService.listProducts(branchId);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting inventory",
    });
  }
};

const addRecipes = async (req, res) => {
  try {
    const result = await inventoryRecipesService.addRecipe({
      productId: req.body.product_id,
      name: req.body.name,
      description: req.body.description,
      ingredients: req.body.ingredients,
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
    const branchId = Number(req.query.branch_id) || 1;
    const alerts = await inventoryRecipesService.getStockAlerts(branchId);
    return res.status(200).json(alerts);
  } catch (error) {
    return res.status(500).json({
      message: "Error verifiying stock",
    });
  }
};

const prepareRecipe = async (req, res) => {
  try {
    const result = await inventoryRecipesService.prepareRecipe({
      recipeId: req.body.id,
      recipeQuantity: req.body.quantity,
      branchId: Number(req.body.branch_id) || 1,
      employeeId: Number(req.body.employee_id) || 1,
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
    const result = await inventoryRecipesService.addCatalog({
      name: req.body.name,
      price: Number(req.body.price),
      productType: req.body.productType || "PREPARED",
      supplierId:
        req.body.supplierId !== undefined ? Number(req.body.supplierId) : null,
      unitCost:
        req.body.unitCost !== undefined ? Number(req.body.unitCost) : null,
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

module.exports = {
  addProducts,
  listProducts,
  addRecipes,
  listRecipes,
  listMenu,
  alertStock,
  prepareRecipe,
  addCatalog,
};
