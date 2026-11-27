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
  branchId,
  supplierId,
  employeeId,
  name,
  unit = "UNIT",
  quantity,
  minStock = 15,
}) => {
  const parsedBranchId = Number(branchId);
  const parsedSupplierId = Number(supplierId);
  const parsedEmployeeId = Number(employeeId);
  const cleanName = String(name || "").trim();
  const cleanUnit = String(unit || "").trim().toUpperCase();
  const parsedQty = Number(quantity);
  const parsedMinStock = Number(minStock);
  const validUnits = ["G", "KG", "ML", "L", "UNIT"];
  if (
    !cleanName ||
    cleanName.length > 100 ||
    !validUnits.includes(cleanUnit) ||
    !Number.isInteger(parsedBranchId) ||
    parsedBranchId <= 0 ||
    !Number.isInteger(parsedSupplierId) ||
    parsedSupplierId <= 0 ||
    !Number.isInteger(parsedEmployeeId) ||
    parsedEmployeeId <= 0 ||
    !Number.isFinite(parsedQty) ||
    parsedQty <= 0 ||
    (cleanUnit === "UNIT" && !Number.isInteger(parsedQty)) ||
    !Number.isFinite(parsedMinStock) ||
    parsedMinStock < 0 ||
    (cleanUnit === "UNIT" && !Number.isInteger(parsedMinStock))
  ) {
    throw createHttpError(400, "El insumo, unidad, sucursal, proveedor y cantidades deben ser válidos");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const supplier = await inventoryRecipesRepo.findSupplierById(
      parsedSupplierId,
      client,
    );
    if (!supplier) {
      throw createHttpError(400, "El proveedor seleccionado no existe");
    }

    let supply = await inventoryRecipesRepo.findSupplyByName(cleanName, client);
    if (!supply) {
      supply = await inventoryRecipesRepo.createSupply(
        { supplierId: parsedSupplierId, name: cleanName, unit: cleanUnit },
        client,
      );
    } else if (Number(supply.supplier_id) !== parsedSupplierId) {
      throw createHttpError(
        409,
        "Ya existe un insumo con ese nombre asociado a otro proveedor",
      );
    } else if (supply.unit !== cleanUnit) {
      throw createHttpError(
        409,
        `Este insumo ya está registrado en ${supply.unit}; usá esa unidad`,
      );
    }

    const inventory = await inventoryRecipesRepo.upsertBranchSupplyInventory(
      {
        branchId: parsedBranchId,
        supplyId: supply.id,
        quantity: parsedQty,
        minStock: parsedMinStock,
      },
      client,
    );
    await inventoryRecipesRepo.createInventoryMovement(
      {
        branchId: parsedBranchId,
        employeeId: parsedEmployeeId,
        supplyId: supply.id,
        movementType: "IN",
        quantity: parsedQty,
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
    if (error.code === "23503") {
      throw createHttpError(400, "La sucursal o el proveedor seleccionado no existe");
    }
    throw error;
  } finally {
    client.release();
  }
};

const listProducts = async (branchId) => {
  return await inventoryRecipesRepo.getInventoryByBranch(branchId);
};

const listSupplies = async () => {
  return await inventoryRecipesRepo.getAllSupplies();
};

const listAvailableSupplies = async (branchId) => {
  return await inventoryRecipesRepo.getAvailableSuppliesByBranch(branchId);
};

const addRecipe = async ({
  productId,
  name,
  description = null,
  ingredients,
  branchId = null,
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

    const existingRecipe = await inventoryRecipesRepo.findRecipeByProductId(
      parsedProductId,
      client,
    );
    if (existingRecipe) {
      throw createHttpError(409, "Este producto ya tiene una receta registrada");
    }

    if (branchId !== null) {
      const availableSupplyIds =
        await inventoryRecipesRepo.getAvailableSupplyIdsByBranch(
          Number(branchId),
          normalizedIngredients.map((ingredient) => ingredient.supplyId),
          client,
        );
      if (availableSupplyIds.length !== normalizedIngredients.length) {
        throw createHttpError(
          400,
          "Solo podés usar insumos con existencia en tu sucursal",
        );
      }
    }

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
    if (error.code === "23505" && error.constraint === "recipe_product_id_key") {
      throw createHttpError(409, "Este producto ya tiene una receta registrada");
    }
    throw error;
  } finally {
    client.release();
  }
};

const updateRecipe = async ({
  recipeId,
  ingredients,
  branchId = null,
}) => {
  const parsedRecipeId = Number(recipeId);

  if (!Number.isInteger(parsedRecipeId) || parsedRecipeId <= 0) {
    throw createHttpError(400, "ID de receta no válido");
  }

  const normalizedIngredients = normalizeIngredients(ingredients);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const recipe = await inventoryRecipesRepo.lockRecipeById(
      parsedRecipeId,
      client,
    );

    if (!recipe) {
      throw createHttpError(404, "Receta no encontrada");
    }

    const supplyIds = normalizedIngredients.map(
      (ingredient) => ingredient.supplyId
    );

    const supplies = await inventoryRecipesRepo.getSuppliesByIds(
      supplyIds,
      client,
    );

    if (supplies.length !== normalizedIngredients.length) {
      throw createHttpError(400, "Uno o más insumos no existen");
    }

    const suppliesById = new Map(
      supplies.map((supply) => [Number(supply.id), supply])
    );

    for (const ingredient of normalizedIngredients) {
      const supply = suppliesById.get(ingredient.supplyId);

      if (
        supply.unit === "UNIT" &&
        !Number.isInteger(ingredient.quantityUsed)
      ) {
        throw createHttpError(
          400,
          `${supply.name} debe registrarse en unidades enteras`,
        );
      }

      if (
        Number(ingredient.quantityUsed.toFixed(3)) !==
        ingredient.quantityUsed
      ) {
        throw createHttpError(
          400,
          "Las cantidades deben tener un máximo de tres decimales",
        );
      }
    }

    if (branchId !== null) {
      const currentIngredients =
        await inventoryRecipesRepo.getRecipeIngredients(
          parsedRecipeId,
          client,
        );

      const currentSupplyIds = new Set(
        currentIngredients.map((ingredient) =>
          Number(ingredient.supply_id)
        )
      );

      const newSupplyIds = supplyIds.filter(
        (supplyId) => !currentSupplyIds.has(supplyId)
      );

      if (newSupplyIds.length > 0) {
        const availableSupplyIds =
          await inventoryRecipesRepo.getAvailableSupplyIdsByBranch(
            Number(branchId),
            newSupplyIds,
            client,
          );

        if (availableSupplyIds.length !== newSupplyIds.length) {
          throw createHttpError(
            400,
            "Los nuevos insumos deben tener existencia en tu sucursal",
          );
        }
      }
    }

    await inventoryRecipesRepo.deleteRecipeDetails(
      parsedRecipeId,
      client,
    );

    for (const ingredient of normalizedIngredients) {
      await inventoryRecipesRepo.createRecipeDetail(
        {
          recipeId: parsedRecipeId,
          supplyId: ingredient.supplyId,
          quantityUsed: ingredient.quantityUsed,
        },
        client,
      );
    }

    await client.query("COMMIT");

    return {
      recipe_id: recipe.id,
      product_id: recipe.product_id,
      name: recipe.name,
      ingredients: normalizedIngredients,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23503") {
      throw createHttpError(400, "Uno de los insumos no existe");
    }

    if (error.code === "22003") {
      throw createHttpError(400, "La cantidad ingresada es demasiado grande");
    }

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

const getStockAlerts = async (branchId) => {
  return await inventoryRecipesRepo.getLowStockByBranch(branchId);
};

const prepareRecipe = async ({
  recipeId,
  recipeQuantity,
  branchId,
  employeeId,
}) => {
  const parsedRecipeId = Number(recipeId);
  const parsedQty = Number(recipeQuantity);
  const parsedBranchId = Number(branchId);
  const parsedEmployeeId = Number(employeeId);

  if (
    !Number.isInteger(parsedRecipeId) ||
    !Number.isInteger(parsedQty) ||
    parsedQty <= 0 ||
    !Number.isInteger(parsedBranchId) ||
    parsedBranchId <= 0 ||
    !Number.isInteger(parsedEmployeeId) ||
    parsedEmployeeId <= 0
  ) {
    throw createHttpError(400, "La receta, cantidad, sucursal o empleado no son válidos");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

const recipe = await inventoryRecipesRepo.lockRecipeById(
  parsedRecipeId,
  client,
);

if (!recipe) {
  throw createHttpError(404, "Receta no encontrada");
}

const ingredients = await inventoryRecipesRepo.getRecipeIngredients(
  parsedRecipeId,
  client,
);

    if (ingredients.length === 0) {
      throw createHttpError(404, "No se encontró la receta o no tiene ingredientes");
    }

    for (const ing of ingredients) {
      const totalNeeded = Number(ing.quantity_used) * parsedQty;
      const stockRow = await inventoryRecipesRepo.getBranchSupplyStockForUpdate(
        parsedBranchId,
        ing.supply_id,
        client,
      );

      if (!stockRow || Number(stockRow.quantity) < totalNeeded) {
        throw createHttpError(400, "No hay suficientes insumos en la sucursal");
      }

      await inventoryRecipesRepo.decrementBranchSupplyStock(
        parsedBranchId,
        ing.supply_id,
        totalNeeded,
        client,
      );

      await inventoryRecipesRepo.createInventoryMovement(
        {
          branchId: parsedBranchId,
          employeeId: parsedEmployeeId,
          supplyId: ing.supply_id,
          movementType: "OUT",
          quantity: -totalNeeded,
        },
        client,
      );
    }

    await client.query("COMMIT");

    const alerts = await inventoryRecipesRepo.getLowStockByBranch(parsedBranchId);
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
  branchId = null,
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
    if (normalizedType === "PREPARED" && branchId !== null) {
      const availableSupplyIds =
        await inventoryRecipesRepo.getAvailableSupplyIdsByBranch(
          Number(branchId),
          normalizedIngredients.map((ingredient) => ingredient.supplyId),
          client,
        );
      if (availableSupplyIds.length !== normalizedIngredients.length) {
        throw createHttpError(
          400,
          "Solo podés usar insumos con existencia en tu sucursal",
        );
      }
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

const listCatalogDetails = async () => {
  return await inventoryRecipesRepo.getProductsWithSupplierInfo();
};

const listPackagedInventory = async (branchId) => {
  return await inventoryRecipesRepo.getPackagedInventoryByBranch(branchId);
};

// Edita nombre y precio; en empaquetados, además proveedor y costo.
// El tipo de producto no se puede cambiar.
const updateCatalog = async ({ id, name, price, supplierId, unitCost }) => {
  const cleanName = String(name || "").trim();
  const isMoney = (value) => Number.isFinite(value) && value >= 0.01;

  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, "ID de producto no válido");
  }
  if (!cleanName || cleanName.length > 100 || !isMoney(price)) {
    throw createHttpError(400, "Ingresá un nombre (máx. 100) y un precio mayor a cero");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const current = await inventoryRecipesRepo.lockProductById(id, client);
    if (!current) {
      throw createHttpError(404, "Producto no encontrado");
    }

    const sameName = await inventoryRecipesRepo.findProductByName(cleanName, client);
    if (sameName && sameName.id !== id) {
      throw createHttpError(409, "Ya existe un producto con ese nombre");
    }

    if (current.product_type === "PACKAGED") {
      if (!Number.isInteger(supplierId) || supplierId <= 0 || !isMoney(unitCost)) {
        throw createHttpError(400, "Seleccioná el proveedor y un costo mayor a cero");
      }
      await inventoryRecipesRepo.updatePackagedProduct(
        { productId: id, supplierId, unitCost },
        client,
      );
    }

    const product = await inventoryRecipesRepo.updateProduct(
      { id, name: cleanName, price },
      client,
    );
    await inventoryRecipesRepo.renameRecipe(
      { productId: id, oldName: current.name, newName: cleanName },
      client,
    );

    await client.query("COMMIT");
    return product;
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23503") {
      throw createHttpError(400, "El proveedor no existe");
    }
    if (error.code === "22003") {
      throw createHttpError(400, "El precio o el costo es demasiado grande");
    }
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  updateCatalog,
  addProductToInventory,
  listProducts,
  listSupplies,
  listAvailableSupplies,
  addRecipe,
  listRecipes,
  listMenu,
  getStockAlerts,
  prepareRecipe,
  addCatalog,
  listCatalogDetails,
  listPackagedInventory,
  updateRecipe,
};
