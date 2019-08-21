var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
require('./sendEmail')('eugene.vedensky@gmail.com');
// const { publishData, readInventoryAsJson } = require('./jsonUtil');
// const scraperJobs = require('./scraper-jobs');
// const scrapesPerDay = 1000 * 60 * 60 * 24;

// scraperJobs.forEach(scraperJob => scraperJob());
// publishData(readInventoryAsJson(), new AWS.SNS());
