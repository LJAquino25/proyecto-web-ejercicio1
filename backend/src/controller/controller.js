const { json } = require("express");
const inventory = require("../data/data.inventory.js");
const recipes = require("../data/data.recipes.js");

const addProducts = (req, res) => {
  try {
    const productId = Number(req.body.id);
    const productName = req.body.name;
    const productQuantity = Number(req.body.quantity);

    if (
      !Number.isInteger(productId) ||
      !productName ||
      productQuantity <= 0 ||
      Number.isNaN(productQuantity)
    ) {
      return res.status(400).json({
        message: "The product id, name and the quantity must be valid",
      });
    }

    const productIndex = inventory.findIndex((item) => item.id === productId);
    if (productIndex === -1) {
      inventory.push({
        id: productId,
        name: productName,
        quantity: productQuantity,
      });

      return res.status(201).json({
        message: "Product successfully added",
        id: productId,
        name: productName,
        quantity: productQuantity,
      });
    } else {
      const product = inventory[productIndex];
      product.quantity += productQuantity;

      return res.status(200).json({
        message: "Product successfully modified",
        id: productId,
        name: product.name,
        quantity: product.quantity,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error adding products",
    });
  }
};

const listProducts = (req, res) => {
  try {
    res.status(200).json(inventory);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting inventory",
    });
  }
};

const addRecipes = (req, res) => {
  try {
    const recipeId = Number(req.body.id);
    const recipeName = req.body.name;
    const recipeIngredients = req.body.ingredients;

    if (
      !Number.isInteger(recipeId) ||
      !Array.isArray(recipeIngredients) ||
      !recipeName ||
      recipeIngredients.length === 0
    ) {
      return res.status(400).json({
        message: "The recipe id, name and the Ingredients must be valid",
      });
    }

    const seenIngredientIds = new Set();
    const normalizedIngredients = [];

    for (const element of recipeIngredients) {
      const ingredientId = Number(element.id);
      const ingredientQuantity = Number(element.quantity);

      const productIndex = inventory.findIndex(
        (item) => item.id === ingredientId,
      );
      if (
        productIndex === -1 ||
        Number.isNaN(ingredientQuantity) ||
        ingredientQuantity <= 0 ||
        seenIngredientIds.has(ingredientId)
      ) {
        return res.status(400).json({
          message: "The recipe ingredients must be valid and unique",
        });
      }

      seenIngredientIds.add(ingredientId);
      normalizedIngredients.push({
        id: ingredientId,
        quantity: ingredientQuantity,
      });
    }

    const recipeIndex = recipes.findIndex((item) => item.id === recipeId);
    if (recipeIndex === -1) {
      recipes.push({
        id: recipeId,
        name: recipeName,
        ingredients: normalizedIngredients,
      });

      return res.status(201).json({
        message: "Recipe successfully added",
        id: recipeId,
        name: recipeName,
        ingredients: normalizedIngredients,
      });
    } else {
      return res.status(400).json({
        message: "A recipe with this id already exists",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error adding recipe",
    });
  }
};

const listRecipes = (req, res) => {
  try {
    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting the recipes",
    });
  }
};

const listMenu = (req, res) => {
  try {
    const menu = [];
    recipes.forEach((element) => {
      menu.push({ name: element.name });
    });

    return res.status(200).json(menu);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting the menu",
    });
  }
};

const checkStock = () => {
  const lowStock = [];
  inventory.forEach((element) => {
    if (element.quantity < 15) {
      lowStock.push({
        alert: "LOW STOCK",
        productId: element.id,
        quantity: element.quantity,
      });
    }
  });
  return lowStock;
};

const alertStock = (req, res) => {
  try {
    return res.status(200).json(checkStock());
  } catch (error) {
    return res.status(500).json({
      message: "Error getting the stock",
    });
  }
};

const prepareRecipe = (req, res) => {
  try {
    const recipeId = Number(req.body.id);
    const recipeQuantity = Number(req.body.quantity);

    if (
      !Number.isInteger(recipeId) ||
      !Number.isInteger(recipeQuantity) ||
      recipeQuantity <= 0
    ) {
      return res.status(400).json({
        message: "Id or quantity not valid",
      });
    }

    const recipe = recipes.find((i) => i.id === recipeId);

    if (!recipe) {
      return res.status(400).json({
        message: "Recipe not found",
      });
    }

    for (const ingredient of recipe.ingredients) {
      const product = inventory.find((p) => p.id === ingredient.id);
      const usedProducts = ingredient.quantity * recipeQuantity;

      if (!product || usedProducts > product.quantity) {
        return res.status(400).json({
          message: "Insufficient ingredients",
        });
      }
    }

    for (const ingredient of recipe.ingredients) {
      const product = inventory.find((p) => p.id === ingredient.id);
      const usedProducts = ingredient.quantity * recipeQuantity;

      product.quantity -= usedProducts;
    }

    return res.status(200).json({
      message: "Recipe prepared",
      alerts: checkStock(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error preparing the recipe",
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
};
