// Arreglo en memoria para turnos de caja (inicia vacío; las marcas de tiempo se generan en tiempo real)
const cashRegisters = [];

let nextRegisterId = 1;

const getAllCashRegisters = () => cashRegisters;

const getOpenCashRegister = (branch = null) => {
  return (
    cashRegisters.find((register) => {
      const isOpen = register.status === "OPEN";
      if (!branch) {
        return isOpen;
      }
      return (
        isOpen &&
        register.branch.toLowerCase() === String(branch).trim().toLowerCase()
      );
    }) || null
  );
};

const addCashRegister = (registerData) => {
  const newRegister = {
    id: nextRegisterId,
    ...registerData
  };
  nextRegisterId += 1;
  cashRegisters.push(newRegister);
  return newRegister;
};

const getTotalSalesAmount = (salesByMethod) => {
  const methods = [
    Number(salesByMethod.cash) || 0,
    Number(salesByMethod.card) || 0,
    Number(salesByMethod.bitcoinChivo) || 0
  ];
  return Number(methods.reduce((acc, current) => acc + current, 0).toFixed(2));
};

module.exports = {
  cashRegisters,
  getAllCashRegisters,
  getOpenCashRegister,
  addCashRegister,
  getTotalSalesAmount
};