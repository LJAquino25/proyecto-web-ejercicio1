const branchesService = require("./branches.service.js");

const listBranches = async (req, res) => {
  try {
    const branches = await branchesService.getAvailableBranches();
    return res.status(200).json({ branches });
  } catch (error) {
    return res.status(500).json({
      message: "No se pudieron cargar las sucursales.",
      error: error.message
    });
  }
};

module.exports = { listBranches };
