const express = require("express");
const router = express.Router();

const {
  addProducts,
  listProducts,
  addRecipes,
  listRecipes,
  listMenu,
  alertStock,
  prepareRecipe,
} = require("../../modules/inventory-recipes/inventory-recipes.controller.js");

router.post("/products", addProducts);
router.get("/products", listProducts);
router.post("/recipes", addRecipes);
router.get("/recipes", listRecipes);
router.get("/catalog", listMenu);
router.get("/inventory/alerts", alertStock);
router.post("/prepare", prepareRecipe);
router.post("/catalog", addCatalog);

module.exports = router;
