const pool = require("../../config/config.js");

const findSupplyByName = async (name, db = pool) => {
  const result = await db.query(
    "SELECT id, supplier_id, name, unit FROM supply WHERE LOWER(name) = LOWER($1)",
    [name],
  );
  return result.rows[0] || null;
};

const findSupplierById = async (supplierId, db = pool) => {
  const result = await db.query(
    "SELECT id FROM supplier WHERE id = $1",
    [supplierId],
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
     DO UPDATE SET
       quantity = branch_supply_inventory.quantity + EXCLUDED.quantity,
       min_stock = EXCLUDED.min_stock
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

const getAllSupplies = async (db = pool) => {
  const result = await db.query(
    "SELECT id, supplier_id, name, unit FROM supply ORDER BY name ASC"
  );
  return result.rows;
};

const getAvailableSuppliesByBranch = async (branchId, db = pool) => {
  const result = await db.query(
    `SELECT s.id, s.supplier_id, s.name, s.unit, bsi.quantity, bsi.min_stock
     FROM branch_supply_inventory bsi
     JOIN supply s ON s.id = bsi.supply_id
     WHERE bsi.branch_id = $1 AND bsi.quantity > 0
     ORDER BY s.name ASC`,
    [branchId],
  );
  return result.rows;
};

const getAvailableSupplyIdsByBranch = async (branchId, supplyIds, db = pool) => {
  const result = await db.query(
    `SELECT supply_id
     FROM branch_supply_inventory
     WHERE branch_id = $1 AND quantity > 0 AND supply_id = ANY($2::int[])`,
    [branchId, supplyIds],
  );
  return result.rows.map((row) => row.supply_id);
};

const createRecipe = async ({ productId, name, description }, db = pool) => {
  const result = await db.query(
    "INSERT INTO recipe (product_id, name, description) VALUES ($1, $2, $3) RETURNING id, product_id, name, description",
    [productId, name, description],
  );
  return result.rows[0];
};

const findRecipeByProductId = async (productId, db = pool) => {
  const result = await db.query(
    "SELECT id FROM recipe WHERE product_id = $1",
    [productId],
  );
  return result.rows[0] || null;
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
           COALESCE(json_agg(json_build_object(
             'supply_id', s.id,
             'name', s.name,
             'unit', s.unit,
             'quantity_used', rd.quantity_used
           )) FILTER (WHERE rd.supply_id IS NOT NULL), '[]'::json) AS ingredients
    FROM recipe r
    LEFT JOIN recipe_detail rd ON r.id = rd.recipe_id
    LEFT JOIN supply s ON rd.supply_id = s.id
    GROUP BY r.id
    ORDER BY r.id ASC
  `);
  return result.rows;
};

const getCatalog = async (db = pool) => {
  const result = await db.query("SELECT id, name, price, product_type FROM product");
  return result.rows;
};

const getLowStockByBranch = async (branchId, db = pool) => {
  const result = await db.query(
    `SELECT 'LOW STOCK' AS alert, s.id AS supply_id, s.name, s.unit, bsi.quantity, bsi.min_stock
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

const findProductByName = async (name, db = pool) => {
  const result = await db.query(
    `SELECT id, name, price, product_type FROM product WHERE LOWER(name) = LOWER($1)`,
    [name],
  );
  return result.rows[0] || null;
};

const createProduct = async ({ name, price, productType }, db = pool) => {
  const result = await db.query(
    `INSERT INTO product(name, price, product_type)
  VALUES ($1, $2, $3) RETURNING id, name, price, product_type`,
    [name, price, productType],
  );
  return result.rows[0];
};

const createPackagedProduct = async (
  { productId, supplierId, unitCost },
  db = pool,
) => {
  const result = await db.query(
    `INSERT INTO packaged_product(product_id, supplier_id, unit_cost)
    VALUES ($1, $2, $3)`,
    [productId, supplierId, unitCost],
  );
  return result.rows[0];
};

const getProductsWithSupplierInfo = async (db = pool) => {
  const result = await db.query(`
    SELECT 
      p.id,
      p.name,
      p.price,
      p.product_type,
      pp.supplier_id,
      pp.unit_cost
    FROM product p
    LEFT JOIN packaged_product pp ON p.id = pp.product_id
    ORDER BY p.id ASC
  `);
  return result.rows;
};

const getPackagedInventoryByBranch = async (branchId, db = pool) => {
  const result = await db.query(`
    SELECT
      p.id,
      p.name,
      bpi.stock AS quantity,
      bpi.min_stock,
      'UNIT' AS unit
    FROM branch_packaged_inventory bpi
    JOIN product p ON p.id = bpi.product_id
    WHERE bpi.branch_id = $1
    ORDER BY p.name ASC
  `, [branchId]);

  return result.rows;
};

// Bloquea el producto mientras se edita
const lockProductById = async (id, db) => {
  const result = await db.query(
    "SELECT id, name, price, product_type FROM product WHERE id = $1 FOR UPDATE",
    [id],
  );
  return result.rows[0] || null;
};

const updateProduct = async ({ id, name, price }, db) => {
  const result = await db.query(
    `UPDATE product SET name = $2, price = $3 WHERE id = $1
     RETURNING id, name, price, product_type`,
    [id, name, price],
  );
  return result.rows[0];
};

const updatePackagedProduct = async ({ productId, supplierId, unitCost }, db) => {
  await db.query(
    "UPDATE packaged_product SET supplier_id = $2, unit_cost = $3 WHERE product_id = $1",
    [productId, supplierId, unitCost],
  );
};

// La receta solo cambia de nombre si se llamaba igual que el producto
const renameRecipe = async ({ productId, oldName, newName }, db) => {
  await db.query(
    "UPDATE recipe SET name = $3 WHERE product_id = $1 AND name = $2",
    [productId, oldName, newName],
  );
};

module.exports = {
  lockProductById,
  updateProduct,
  updatePackagedProduct,
  renameRecipe,
  findSupplyByName,
  findSupplierById,
  createSupply,
  upsertBranchSupplyInventory,
  getInventoryByBranch,
  getAllSupplies,
  getAvailableSuppliesByBranch,
  getAvailableSupplyIdsByBranch,
  createRecipe,
  findRecipeByProductId,
  createRecipeDetail,
  getAllRecipes,
  getCatalog,
  getLowStockByBranch,
  getRecipeIngredients,
  getBranchSupplyStockForUpdate,
  decrementBranchSupplyStock,
  createInventoryMovement,
  findProductByName,
  createProduct,
  createPackagedProduct,
  getProductsWithSupplierInfo,
  getPackagedInventoryByBranch,
};
