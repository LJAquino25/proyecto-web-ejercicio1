const express = require("express");
const router = express.Router();

const {
  addProducts,
  listProducts,
  listSupplies,
  listAvailableSupplies,
  addRecipes,
  listRecipes,
  editRecipe,
  alertStock,
  prepareRecipe,
  addCatalog,
  listCatalogDetails,
  listPackagedInventory,
  editCatalog,
} = require("../../modules/inventory-recipes/inventory-recipes.controller.js");

const {
  requireEmployee,
  requireAdmin,
  requireKitchenStaff,
} = require("../../middleware/authorization.middleware.js");

router.post("/products", requireAdmin, addProducts);
router.get("/products", requireEmployee, listProducts);
router.get("/supplies", requireEmployee, listSupplies);
router.get("/supplies/available", requireEmployee, listAvailableSupplies);
router.post("/recipes", requireKitchenStaff, addRecipes);
router.get("/recipes", requireEmployee, listRecipes);
router.put("/recipes/:id", requireKitchenStaff, editRecipe);
router.get("/inventory/alerts", requireEmployee, alertStock);
router.post("/prepare", requireEmployee, prepareRecipe);
router.post("/catalog", requireKitchenStaff, addCatalog);
router.get("/catalog/details", requireEmployee, listCatalogDetails);
router.put("/catalog/:id", requireAdmin, editCatalog);
router.get("/packaged-inventory", requireEmployee, listPackagedInventory);

module.exports = router;