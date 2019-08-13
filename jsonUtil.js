var fs = require('fs');
const readInventoryAsJson = async () => {
  const rawCurrentInventory = require('./inventory.json');
  return rawCurrentInventory;
};
const writeInventoryAsJson = async (newInventory, callback) => {
  const updatedRawCurrentInventory = JSON.stringify(newInventory);
  fs.writeFile('inventory.json', updatedRawCurrentInventory, 'utf8', callback);
  return true;
};

getHasedVehicleJson = vehicle => {
  const key = vehicle.link;
  const hashedVehicleJson = {};
  hashedVehicleJson[key] = vehicle;
  return hashedVehicleJson;
};
module.exports = {
  readInventoryAsJson,
  writeInventoryAsJson,
  getHasedVehicleJson
};
