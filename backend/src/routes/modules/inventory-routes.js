const express = require("express");
const router = express.Router();

const {
  addProducts,
  listProducts,
  listSupplies,
  addRecipes,
  listRecipes,
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
} = require("../../middleware/authorization.middleware.js");

router.post("/products", addProducts);
router.get("/products", listProducts);
router.get("/supplies", listSupplies);
router.post("/recipes", addRecipes);
router.get("/recipes", listRecipes);
router.get("/inventory/alerts", alertStock);
router.post("/prepare", prepareRecipe);
router.post("/catalog", requireAdmin, addCatalog);
router.get("/catalog/details", requireEmployee, listCatalogDetails);
router.put("/catalog/:id", requireAdmin, editCatalog);
router.get("/packaged-inventory", listPackagedInventory);

module.exports = router;
