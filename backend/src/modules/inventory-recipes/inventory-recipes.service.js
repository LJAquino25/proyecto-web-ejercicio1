const pool = require("../../config/config.js");
const inventoryRecipesRepo = require("./inventory-recipes.repo.js");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeIngredients = (ingredients) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw createHttpError(400, "El producto preparado debe incluir una receta con insumos");
  }

  const seenSupplyIds = new Set();
  return ingredients.map((item) => {
    const supplyId = Number(item && item.id);
    const quantityUsed = Number(item && item.quantity);

    if (
      !Number.isInteger(supplyId) ||
      supplyId <= 0 ||
      !Number.isFinite(quantityUsed) ||
      quantityUsed <= 0 ||
      seenSupplyIds.has(supplyId)
    ) {
      throw createHttpError(400, "Los insumos deben ser válidos, positivos y no repetirse");
    }

    seenSupplyIds.add(supplyId);
    return { supplyId, quantityUsed };
  });
};

const addProductToInventory = async ({
  branchId = 1,
  supplierId = 1,
  name,
  unit = "UNIT",
  quantity,
  minStock = 15,
}) => {
  const parsedQty = Number(quantity);
  if (!name || Number.isNaN(parsedQty) || parsedQty <= 0) {
    throw createHttpError(400, "Name and quantity are obligatory");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let supply = await inventoryRecipesRepo.findSupplyByName(name, client);
    if (!supply) {
      supply = await inventoryRecipesRepo.createSupply(
        { supplierId, name, unit },
        client,
      );
    }

    const inventory = await inventoryRecipesRepo.upsertBranchSupplyInventory(
      {
        branchId,
        supplyId: supply.id,
        quantity: parsedQty,
        minStock:
          minStock !== undefined && minStock !== null && minStock !== ""
            ? Number(minStock)
            : 15,
      },
      client,
    );

    await client.query("COMMIT");

    return {
      supply_id: supply.id,
      name: supply.name,
      inventory,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const listProducts = async (branchId = 1) => {
  return await inventoryRecipesRepo.getInventoryByBranch(branchId);
};

const listSupplies = async () => {
  return await inventoryRecipesRepo.getAllSupplies();
};

const addRecipe = async ({
  productId,
  name,
  description = null,
  ingredients,
}) => {
  const parsedProductId = Number(productId);
  const cleanName = String(name || "").trim();

  if (
    !Number.isInteger(parsedProductId) ||
    parsedProductId <= 0 ||
    !cleanName
  ) {
    throw createHttpError(400, "product_id and name are required");
  }

  const normalizedIngredients = normalizeIngredients(ingredients);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const recipe = await inventoryRecipesRepo.createRecipe(
      { productId: parsedProductId, name: cleanName, description },
      client,
    );

    for (const ing of normalizedIngredients) {
      await inventoryRecipesRepo.createRecipeDetail(
        {
          recipeId: recipe.id,
          supplyId: ing.supplyId,
          quantityUsed: ing.quantityUsed,
        },
        client,
      );
    }

    await client.query("COMMIT");

    return {
      recipe_id: recipe.id,
      name: recipe.name,
      ingredients: normalizedIngredients,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const listRecipes = async () => {
  return await inventoryRecipesRepo.getAllRecipes();
};

const listMenu = async () => {
  return await inventoryRecipesRepo.getCatalog();
};

const getStockAlerts = async (branchId = 1) => {
  return await inventoryRecipesRepo.getLowStockByBranch(branchId);
};

const prepareRecipe = async ({
  recipeId,
  recipeQuantity,
  branchId = 1,
  employeeId = 1,
}) => {
  const parsedRecipeId = Number(recipeId);
  const parsedQty = Number(recipeQuantity);

  if (
    !Number.isInteger(parsedRecipeId) ||
    !Number.isInteger(parsedQty) ||
    parsedQty <= 0
  ) {
    throw createHttpError(400, "Recipe ID or quantity invalids");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const ingredients = await inventoryRecipesRepo.getRecipeIngredients(
      parsedRecipeId,
      client,
    );

    if (ingredients.length === 0) {
      throw createHttpError(404, "Recipe not found or not enought ingredients");
    }

    for (const ing of ingredients) {
      const totalNeeded = Number(ing.quantity_used) * parsedQty;
      const stockRow = await inventoryRecipesRepo.getBranchSupplyStockForUpdate(
        branchId,
        ing.supply_id,
        client,
      );

      if (!stockRow || Number(stockRow.quantity) < totalNeeded) {
        throw createHttpError(400, "Not enougtht suplies");
      }

      await inventoryRecipesRepo.decrementBranchSupplyStock(
        branchId,
        ing.supply_id,
        totalNeeded,
        client,
      );

      await inventoryRecipesRepo.createInventoryMovement(
        {
          branchId,
          employeeId,
          supplyId: ing.supply_id,
          movementType: "OUT",
          quantity: -totalNeeded,
        },
        client,
      );
    }

    await client.query("COMMIT");

    const alerts = await inventoryRecipesRepo.getLowStockByBranch(branchId);
    return { alerts };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const addCatalog = async ({
  name,
  price,
  productType = "PREPARED",
  supplierId = null,
  unitCost = null,
  ingredients,
}) => {
  const normalizedType = String(productType).toUpperCase();
  const cleanName = String(name || "").trim();
  if (!cleanName || !Number.isFinite(price) || price <= 0) {
    throw createHttpError(400, "Name or price not valid");
  }

  if (!["PREPARED", "PACKAGED"].includes(normalizedType)) {
    throw createHttpError(400, "Product type must be PREPARED or PACKAGED");
  }

  const normalizedIngredients =
    normalizedType === "PREPARED" ? normalizeIngredients(ingredients) : [];

  if (normalizedType === "PACKAGED") {
    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      throw createHttpError(
        400,
        "Valid supplierId is required for PACKAGED products",
      );
    }
    if (!Number.isFinite(unitCost) || unitCost === null || unitCost <= 0) {
      throw createHttpError(
        400,
        "Valid unitCost is required for PACKAGED products",
      );
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let product = await inventoryRecipesRepo.findProductByName(cleanName, client);
    if (product) {
      throw createHttpError(400, "A product with this name already exists");
    }
    product = await inventoryRecipesRepo.createProduct(
      { name: cleanName, price, productType: normalizedType },
      client,
    );
    let recipeId = null;
    if (normalizedType == "PACKAGED") {
      const productId = product.id;
      await inventoryRecipesRepo.createPackagedProduct(
        { productId, supplierId, unitCost },
        client,
      );
    } else {
      const recipe = await inventoryRecipesRepo.createRecipe(
        { productId: product.id, name: product.name },
        client,
      );
      recipeId = recipe.id;
      for (const ingredient of normalizedIngredients) {
        await inventoryRecipesRepo.createRecipeDetail(
          {
            recipeId,
            supplyId: ingredient.supplyId,
            quantityUsed: ingredient.quantityUsed,
          },
          client,
        );
      }
    }

    await client.query("COMMIT");

    return {
      product_id: product.id,
      name: product.name,
      price: product.price,
      product_type: product.product_type,
      ...(recipeId ? { recipe_id: recipeId } : {}),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  addProductToInventory,
  listProducts,
  listSupplies,
  addRecipe,
  listRecipes,
  listMenu,
  getStockAlerts,
  prepareRecipe,
  addCatalog,
};
