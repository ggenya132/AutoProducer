var fs = require('fs');
const readInventoryAsJson = () => {
  const rawCurrentInventory = require('./inventory.json');
  return rawCurrentInventory;
};
const writeInventoryAsJson = async (newInventory, callback) => {
  const updatedRawCurrentInventory = JSON.stringify(newInventory);
  console.log('Overwriting inventory');
  // console.log(newInventory);
  fs.writeFile('inventory.json', updatedRawCurrentInventory, 'utf8', callback);
  return true;
};
getHasedVehicleJson = vehicle => {
  console.log('Hashing vehicle ' + vehicle.name);
  if(vehicle) {
    console.log(vehicle);
    const key = vehicle.link;
    const hashedVehicleJson = {};
    vehicle['scrapeDate'] = new Date();
    hashedVehicleJson[key] = vehicle;
    console.log(hashedVehicleJson);
    return hashedVehicleJson;
  }
};
const getAllNewInventory = (inventory, interval) => {
  const newInventory = [];
  console.log('Getting all vehicles added within last '+(interval/(1000*60))+' minutes');
  for (key in inventory) {
    const vehicle = inventory[key];
    if (vehicleIsNew(vehicle, interval)) {
      newInventory.push(vehicle);
    }
  }
  // console.log(newInventory);
  return newInventory;
};
const vehicleIsNew = (vehicle, interval) => {
  const currentDateMilis = Date.parse(new Date());
  const intervalAgoMilis = currentDateMilis - interval;
  const scrapeMilis = Date.parse(vehicle.scrapeDate);
  return scrapeMilis > intervalAgoMilis;
};
const formatVehicleAsSmsString = ({ name, price, link }) => {
  return `${name}, ${price}, ${link}`;
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
      else console.log(data);
    });
  });
};

const publishData = (inventory, sns) => {
  const interval = 24 * 60 * 60 * 1000;
  const inventoryToPublish = getAllNewInventory(inventory, interval);
  console.log({ inventoryToPublish });
  sendSms(inventoryToPublish, sns);
};

const formatVehicleAsHtmlEmailText = ({ name, price, link }) => {
  return `<div><p><a href='${link}'>${name}</a></p><p>${price}</p></div>`;
};

function invokeAllScraperJobs(scraperJobs) {
  console.log('Starting scrape at '+(new Date()));
  scraperJobs.forEach(async scraperJob => {
    await scraperJob();
  });
  console.log('Scraping complete');
  return true;
}

module.exports = {
  readInventoryAsJson,
  writeInventoryAsJson,
  getHasedVehicleJson,
  vehicleIsNew,
  formatVehicleAsSmsString,
  formatVehicleAsHtmlEmailText,
  getAllNewInventory,
  sendSms,
  publishData,
  invokeAllScraperJobs
};
