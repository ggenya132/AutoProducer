var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
const {
  getInventoryToSendAsSms,
  formatVehicleAsHtmlEmailText,
  invokeAllScraperJobs
} = require('./jsonUtil');

const { subscribers } = require('./config.json');

const scraperJobs = require('./scraper-jobs');
invokeAllScraperJobs(scraperJobs)
  .then(scrapingIsDone =>
    getInventoryToSendAsSms(require('./inventory.json'))
      .map(formatVehicleAsHtmlEmailText)
      .join('')
      .trim()
  )
  .then(html => {
    require('./sendEmail')(subscribers, html);
  });
