const pool = require("../../config/config.js");

const listAvailableBranches = async () => {
  const { rows } = await pool.query(
    `SELECT id, name, address, phone
     FROM branch
     ORDER BY name ASC, id ASC`
  );
  return rows;
};

module.exports = { listAvailableBranches };
