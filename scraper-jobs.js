const scraperJobs = [];
var AWS = require('aws-sdk');
const puppeteer = require('puppeteer');
const {
  readInventoryAsJson,
  getHasedVehicleJson,
  writeInventoryAsJson
} = require('./jsonUtil');
let inventory = readInventoryAsJson();

const autoScout24Format = () => {
  console.log('Scraping with autoScout24Formatter');
  let cars = [];

  let carElements = document.querySelectorAll(
    'div.cldt-summary-full-item-main'
  );
  carElements.forEach(carElement => {
    let carJson = {};
    try {
      carJson.name =
        carElement
          .querySelector('h2.cldt-summary-makemodel')
          .innerText.replace('\n', ' ') +
        ' ' +
        carElement
          .querySelector('h2.cldt-summary-version')
          .innerText.replace('\n', ' ');
      carJson.price = carElement
        .querySelector('span.cldt-price')
        .innerText.replace('\n', ' ');
      carJson.link =
        'https://www.autoscout24.pl' +
        carElement
          .querySelector('div.cldt-summary-titles')
          .getElementsByTagName('a')[0]
          .getAttribute('href');
    } catch (exception) {}
    cars.push(carJson);
  });
  console.log('Scraped ' + cars.length + ' cars');
  return cars;
};

const otomotoFormat = () => {
  console.log('Scraping with otomotoFormatter');
  let cars = [];
  let carElements = document.querySelectorAll('div.offer-item__content');
  carElements.forEach(carElement => {
    let carJson = {};
    try {
      carJson.name = carElement
        .querySelector('div.offer-item__title')
        .innerText.replace('\n', ' ');
      carJson.price = carElement
        .querySelector('div.offer-item__price')
        .innerText.replace('\n', ' ');
    } catch (exception) {}
    cars.push(carJson);
  });
  let carElementsParentContainers = document.querySelectorAll('.adListingItem');
  carElementsParentContainers.forEach((parent, index) => {
    const href = parent.getAttribute('data-href');
    cars[index]['link'] = href;
  });
  console.log('Scraped ' + cars.length + ' cars');
  return cars;
};

function scraper(scraperFormat, urlToScrape) {
  // console.log({ inventory });
  async function scraperFunctionWithFormatForUrl() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log('scraper with URL ' + urlToScrape);
    await page.goto(urlToScrape);
    let carData = await page.evaluate(scraperFormat);
    carsNotInInventory = carData.reduce((acc, next) => {
      if (!inventory.hasOwnProperty(next.link) && next !== undefined) {
        acc = { ...acc, ...getHasedVehicleJson(next) };
      }
      return acc;
    }, {});
    delete carsNotInInventory[undefined];
    if (Object.keys(carsNotInInventory).length > 0) {
      inventory = { ...inventory, ...carsNotInInventory };
      writeInventoryAsJson(inventory);
    }
    await browser.close();
  }
  return scraperFunctionWithFormatForUrl;
}

const otomotoGClassURL =
  'https://www.otomoto.pl/osobowe/mercedes-benz/g-klasa/od-1986/?search%5Bfilter_float_price%3Afrom%5D=2000&search%5Bfilter_float_price%3Ato%5D=200000&search%5Bfilter_float_year%3Ato%5D=1995&search%5Bfilter_enum_fuel_type%5D=diesel&search%5Bnew_used%5D=on';
const otomoroDefenderURL =
  'https://www.otomoto.pl/osobowe/land-rover/defender/od-1987/?search%5Bfilter_float_price%3Afrom%5D=2000&search%5Bfilter_float_price%3Ato%5D=200000&search%5Bfilter_float_year%3Ato%5D=1995&search%5Bfilter_enum_fuel_type%5D=diesel&search%5Bnew_used%5D=on';
const autoScout24GClassURL =
  'https://www.autoscout24.pl/lst/mercedes-benz/klasa-g-(wszystkie)?sort=price&desc=0&gear=M&fuel=D&ustate=N%2CU&fregto=1995&fregfrom=1986&atype=C';
const autoScout24DefenderURL =
  'https://www.autoscout24.pl/lst/land-rover/defender?sort=age&desc=1&gear=M&fuel=D&ustate=N%2CU&size=20&page=1&pricefrom=1000&fregto=1995&fregfrom=1987&atype=C&';

scraperJobs.push(scraper(otomotoFormat, otomotoGClassURL));
scraperJobs.push(scraper(otomotoFormat, otomotoGClassURL));
scraperJobs.push(scraper(autoScout24Format, autoScout24GClassURL));
scraperJobs.push(scraper(autoScout24Format, autoScout24DefenderURL));

module.exports = scraperJobs;
