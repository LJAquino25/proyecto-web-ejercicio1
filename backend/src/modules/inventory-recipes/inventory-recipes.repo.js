const pool = require("../../config/config.js");

const findSupplyByName = async (name, db = pool) => {
  const result = await db.query(
    "SELECT id, name, unit FROM supply WHERE LOWER(name) = LOWER($1)",
    [name],
  );
  return result.rows[0] || null;
};

const createSupply = async ({ supplierId, name, unit }, db = pool) => {
  const result = await db.query(
    "INSERT INTO supply (supplier_id, name, unit) VALUES ($1, $2, $3) RETURNING id, name, unit",
    [supplierId, name, unit],
  );
  return result.rows[0];
};

const upsertBranchSupplyInventory = async (
  { branchId, supplyId, quantity, minStock },
  db = pool,
) => {
  const result = await db.query(
    `INSERT INTO branch_supply_inventory (branch_id, supply_id, quantity, min_stock)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (branch_id, supply_id)
     DO UPDATE SET quantity = branch_supply_inventory.quantity + EXCLUDED.quantity
     RETURNING *`,
    [branchId, supplyId, quantity, minStock],
  );
  return result.rows[0];
};

const getInventoryByBranch = async (branchId, db = pool) => {
  const result = await db.query(
    `SELECT s.id, s.name, s.unit, bsi.quantity, bsi.min_stock
     FROM branch_supply_inventory bsi
     JOIN supply s ON bsi.supply_id = s.id
     WHERE bsi.branch_id = $1
     ORDER BY s.id ASC`,
    [branchId],
  );
  return result.rows;
};

const createRecipe = async ({ productId, name, description }, db = pool) => {
  const result = await db.query(
    "INSERT INTO recipe (product_id, name, description) VALUES ($1, $2, $3) RETURNING id, product_id, name, description",
    [productId, name, description],
  );
  return result.rows[0];
};

const createRecipeDetail = async (
  { recipeId, supplyId, quantityUsed },
  db = pool,
) => {
  const result = await db.query(
    "INSERT INTO recipe_detail (recipe_id, supply_id, quantity_used) VALUES ($1, $2, $3) RETURNING *",
    [recipeId, supplyId, quantityUsed],
  );
  return result.rows[0];
};

const getAllRecipes = async (db = pool) => {
  const result = await db.query(`
    SELECT r.id, r.product_id, r.name, r.description,
           json_agg(json_build_object(
             'supply_id', s.id,
             'name', s.name,
             'unit', s.unit,
             'quantity_used', rd.quantity_used
           )) AS ingredients
    FROM recipe r
    JOIN recipe_detail rd ON r.id = rd.recipe_id
    JOIN supply s ON rd.supply_id = s.id
    GROUP BY r.id
    ORDER BY r.id ASC
  `);
  return result.rows;
};

const getPreparedMenu = async (db = pool) => {
  const result = await db.query(
    "SELECT id, name, price FROM product WHERE product_type = 'PREPARED' ORDER BY name ASC",
  );
  return result.rows;
};

const getLowStockByBranch = async (branchId, db = pool) => {
  const result = await db.query(
    `SELECT 'LOW STOCK' AS alert, s.id AS supply_id, s.name, bsi.quantity, bsi.min_stock
     FROM branch_supply_inventory bsi
     JOIN supply s ON bsi.supply_id = s.id
     WHERE bsi.branch_id = $1 AND bsi.quantity <= bsi.min_stock`,
    [branchId],
  );
  return result.rows;
};

const getRecipeIngredients = async (recipeId, db = pool) => {
  const result = await db.query(
    "SELECT supply_id, quantity_used FROM recipe_detail WHERE recipe_id = $1",
    [recipeId],
  );
  return result.rows;
};

const getBranchSupplyStockForUpdate = async (branchId, supplyId, db = pool) => {
  const result = await db.query(
    "SELECT quantity FROM branch_supply_inventory WHERE branch_id = $1 AND supply_id = $2 FOR UPDATE",
    [branchId, supplyId],
  );
  return result.rows[0] || null;
};

const decrementBranchSupplyStock = async (
  branchId,
  supplyId,
  amount,
  db = pool,
) => {
  await db.query(
    "UPDATE branch_supply_inventory SET quantity = quantity - $1 WHERE branch_id = $2 AND supply_id = $3",
    [amount, branchId, supplyId],
  );
};

const createInventoryMovement = async (
  { branchId, employeeId, supplyId, movementType, quantity },
  db = pool,
) => {
  await db.query(
    `INSERT INTO inventory_movement (branch_id, employee_id, supply_id, movement_type, quantity)
     VALUES ($1, $2, $3, $4, $5)`,
    [branchId, employeeId, supplyId, movementType, quantity],
  );
};

module.exports = {
  findSupplyByName,
  createSupply,
  upsertBranchSupplyInventory,
  getInventoryByBranch,
  createRecipe,
  createRecipeDetail,
  getAllRecipes,
  getPreparedMenu,
  getLowStockByBranch,
  getRecipeIngredients,
  getBranchSupplyStockForUpdate,
  decrementBranchSupplyStock,
  createInventoryMovement,
};
