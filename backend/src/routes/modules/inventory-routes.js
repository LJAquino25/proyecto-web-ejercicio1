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
} = require("../../controller/controller.js");

router.post("/products", addProducts);
router.get("/products", listProducts);
router.post("/recipes", addRecipes);
router.get("/recipes", listRecipes);
router.get("/catalog", listMenu);
router.get("/inventory/alerts", alertStock);
router.post("/prepare", prepareRecipe);

module.exports = router;
