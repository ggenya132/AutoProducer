var fs = require('fs');
const readInventoryAsJson = () => {
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
  vehicle['scrapeDate'] = new Date();
  hashedVehicleJson[key] = vehicle;
  return hashedVehicleJson;
};
const getInventoryToSendAsSms = inventory => {
  const newInventory = [];
  for (key in inventory) {
    const vehicle = inventory[key];
    if (vehicleIsFromToday(vehicle)) {
      newInventory.push(vehicle);
    }
  }
  return newInventory;
};
const vehicleIsFromToday = vehicle => {
  const currentDateMilis = Date.parse(new Date());
  const dayAgoMilis = currentDateMilis - 1000 * 60 * 60 * 24;
  const scrapeMilis = Date.parse(vehicle.scrapeDate);
  return scrapeMilis > dayAgoMilis;
};
const formatVehicleAsSmsString = ({ name, price, link }) => {
  return `Model: ${name}, Price:${price}, Link: ${link}`;
};
const sendSms = (inventory, sns) => {
  const TopicArn = 'arn:aws:sns:us-east-1:674309893935:AutoTopic';

  const parsedStringArray = inventory.map(formatVehicleAsSmsString);
  console.log({ parsedStringArray });
  parsedStringArray.forEach(parsedString => {
    const params = {
      Message: parsedString,
      Subject: 'Test SNS From Lambda',
      TopicArn
    };
    sns.publish(params, function(err, data) {
      if (err) console.log(err, err.stack);
      // an error occurred
      else console.log(data); // successful response
    });
  });
};

const publishData = (inventory, sns) => {
  const inventoryToPublish = getInventoryToSendAsSms(inventory);
  console.log({ inventoryToPublish });
  sendSms(inventoryToPublish, sns);
};

const formatVehicleAsHtmlEmailText = ({ name, price, link }) => {
  return `<div><p><strong>Name:</strong>${name},</p><p><strong>Price:</strong>${price}</p><p><strong>Link:</strong><a href='${link}'>${link}</a></p></div>`;
};

async function invokeAllScraperJobs(scraperJobs) {
  scraperJobs.forEach(async scraperJob => {
    await scraperJob;
  });

  return true;
}

module.exports = {
  readInventoryAsJson,
  writeInventoryAsJson,
  getHasedVehicleJson,
  vehicleIsFromToday,
  formatVehicleAsSmsString,
  formatVehicleAsHtmlEmailText,
  getInventoryToSendAsSms,
  sendSms,
  publishData,
  invokeAllScraperJobs
};
