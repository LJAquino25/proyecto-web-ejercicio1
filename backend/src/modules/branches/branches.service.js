const branchesRepo = require("./branches.repo.js");

const getAvailableBranches = async () => branchesRepo.listAvailableBranches();

module.exports = { getAvailableBranches };
