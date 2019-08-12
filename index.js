var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
const scraperJobs = require('./scraper-jobs');
scraperJobs.forEach(scraperJob => scraperJob());
