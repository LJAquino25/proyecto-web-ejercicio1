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
} = require("../../modules/inventory-recipes/inventory-recipes.controller.js");

router.post("/products", addProducts);
router.get("/products", listProducts);
router.get("/supplies", listSupplies);
router.post("/recipes", addRecipes);
router.get("/recipes", listRecipes);
router.get("/inventory/alerts", alertStock);
router.post("/prepare", prepareRecipe);
router.post("/catalog", addCatalog);
router.get("/catalog/details", listCatalogDetails);
router.get("/packaged-inventory", listPackagedInventory);

module.exports = router;
