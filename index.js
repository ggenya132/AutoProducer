var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
const {
  getAllNewInventory,
  formatVehicleAsHtmlEmailText,
  invokeAllScraperJobs
} = require('./jsonUtil');

const { subscribers } = require('./config.json');

const interval = 1 * 60 * 60 * 1000;

const scraperJobs = require('./scraper-jobs');
invokeAllScraperJobs(scraperJobs).then(allScrapesAreDone => {
  let formattedNewInventory = getAllNewInventory(
    require('./inventory.json'),
    interval
  )
    .map(formatVehicleAsHtmlEmailText)
    .join('')
    .trim();
  console.log('Sending email to: ' + subscribers);
  console.log('Email content' + formattedNewInventory);
  require('./sendEmail')(subscribers, formattedNewInventory);
});
