const scraperJobs = [];
var AWS = require('aws-sdk');
const puppeteer = require('puppeteer');
const {
  readInventoryAsJson,
  getHasedVehicleJson,
  writeInventoryAsJson,
  vehicleIsFromToday
} = require('./jsonUtil');
let inventory = readInventoryAsJson();
// We use this variable to decide if we're building our car inventory or whether we need to start publishing vehicles,
// We don't want to pubish anything we already have in inventory
let isFirstTimeRunningScraperJobs = true;
function scraperOtomoto(urlToScrape) {
  console.log({ inventory });
  for (key in inventory) {
    console.log({ vehicleIsFromToday: vehicleIsFromToday(inventory[key]) });
  }
  function scraperFunctionForUrl() {
    (async () => {
      console.log({ puppeteer });
      const browser = await puppeteer.launch({
        headless: true
      });
      const page = await browser.newPage();
      console.log('sup');
      await page.goto(urlToScrape);
      let classGData = await page.evaluate(() => {
        let classGs = [];
        // get the hotel elements

        let classGElemenets = document.querySelectorAll(
          'div.offer-item__content'
        );

        // get the hotel data
        classGElemenets.forEach(classGElemenet => {
          let classGJson = {};
          try {
            classGJson.name = classGElemenet.querySelector(
              'div.offer-item__title'
            ).innerText;
            classGJson.price = classGElemenet.querySelector(
              'div.offer-item__price'
            ).innerText;
            // hotelJson.reviews = hotelelement.querySelector(
            //   'span.review-score-widget__subtext'
            // ).innerText;
            // hotelJson.rating = hotelelement.querySelector(
            //   'span.review-score-badge'
            // ).innerText;
            // if (hotelelement.querySelector('strong.price')) {
            //   hotelJson.price = hotelelement.querySelector(
            //     'strong.price'
            //   ).innerText;
            // }
          } catch (exception) {}
          classGs.push(classGJson);
        });
        let classGElemenetsParentContainers = document.querySelectorAll(
          '.adListingItem'
        );
        classGElemenetsParentContainers.forEach((parent, index) => {
          const href = parent.getAttribute('data-href');
          classGs[index]['link'] = href;
        });
        return classGs;
        // return articleElements;
      });
      hasedInventory = classGData.reduce((acc, next) => {
        // IF DON'T ALREADY HAVE THIS THING
        console.log({ hasOwnProp: inventory.hasOwnProperty(next.link) });
        if (!inventory.hasOwnProperty(next.link)) {
          console.log('in acc block');
          acc = { ...acc, ...getHasedVehicleJson(next) };
        }
        return acc;
      }, {});
      let parsedString = classGData
        // We only want cars we don't already have in inventory
        .filter(({ link }) => !inventory.hasOwnProperty(link))
        .map(({ name, price, link }) => {
          return `Model: ${name}, Price:${price}, Link: ${link}`;
        })
        .join(' ')
        .trim();

      if (Object.keys(hasedInventory).length > 0) {
        inventory = { ...inventory, ...hasedInventory };

        writeInventoryAsJson(inventory);
      }

      await browser.close();
    })();
  }
  return scraperFunctionForUrl;
}

let doScrapeOtomotoGClass = scraperOtomoto(
  'https://www.otomoto.pl/osobowe/mercedes-benz/g-klasa/od-1986/?search%5Bfilter_float_price%3Afrom%5D=2000&search%5Bfilter_float_price%3Ato%5D=200000&search%5Bfilter_float_year%3Ato%5D=1995&search%5Bfilter_enum_fuel_type%5D=diesel&search%5Bnew_used%5D=on'
);
scraperJobs.push(doScrapeOtomotoGClass);

let doScrapeOtomotoDefender = scraperOtomoto(
  'https://www.otomoto.pl/osobowe/land-rover/defender/od-1987/?search%5Bfilter_float_price%3Afrom%5D=2000&search%5Bfilter_float_price%3Ato%5D=200000&search%5Bfilter_float_year%3Ato%5D=1995&search%5Bfilter_enum_fuel_type%5D=diesel&search%5Bnew_used%5D=on'
);
scraperJobs.push(doScrapeOtomotoDefender);

function scraperAutoScout24(urlToScrape) {
  console.log({ inventory });

  function scraperFunctionForUrl() {
    (async () => {
      console.log({ puppeteer });
      const browser = await puppeteer.launch({
        headless: true
      });
      const page = await browser.newPage();
      console.log('scraperAutoScout24 with URL ' + urlToScrape);
      await page.goto(urlToScrape);
      let classGData = await page.evaluate(() => {
        let classGs = [];

        //example list item
        // <div class="cl-list-element cl-list-element-gap" data-guid="490f2d79-b2fe-4784-a242-eb61706b9795">
        // <div id="li-490f2d79-b2fe-4784-a242-eb61706b9795" class="cldt-summary-full-item  is-ot-transactable-false" data-item-name="listing-summary-container" data-vehicle-type="C" data-test="listing-summary">
        // <div class="cldt-summary-full-item-main" data-item-name="listing-summary-full-main-container" data-test="listing-summary-main-full" data-articleid="380458576" data-deleted="true">
        // <div class="cldt-summary-headline">
        // <div class="cldt-summary-titles">
        // <a data-item-name="detail-page-link" href="/oferta/land-rover-defender-109-santana-2500-diesel-3-tuerer-lang-diesel-zielony-490f2d79-b2fe-4784-a242-eb61706b9795?cldtidx=1">
        // <div class="cldt-summary-title" data-test="listing-summary-title" data-item-name="headline">
        // <h2 class="cldt-summary-makemodel sc-font-bold sc-ellipsis"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Land Rover Defender</font></font></h2>
        // <h2 class="cldt-summary-version sc-ellipsis"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">109 Santana 2500 Diesel 3-Türer lang</font></font></h2>
        // </div>
        // </a>
        // </div>
        // <div class="cldt-summary" data-click-detail-page="true">
        // <div class="cldt-summary-pricing" data-item-name="pricing">
        // <div class="cldt-summary-payment">
        // <span class="cldt-price sc-font-xl sc-font-bold" data-item-name="price"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">
        // € 4.299, -
        // </font></font></span>
        // </div>
        // <div class="cldt-summary-pricing__badges" data-item-name="price-label">
        // <div class="cldt-summary-seal cldt-hide-seal" data-item-name="seal">
        // <img data-src="/seals/classified-list-item/490f2d79-b2fe-4784-a242-eb61706b9795?culture=pl-PL" src="/seals/classified-list-item/490f2d79-b2fe-4784-a242-eb61706b9795?culture=pl-PL">
        // </div>
        // </div>
        // </div>
        // <div class="cldt-summary-vehicle-data" data-item-name="vehicle-data">
        // <ul data-item-name="vehicle-details">
        // <li><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">
        // 106,300 km

        let classGElemenets = document.querySelectorAll(
          'div.cldt-summary-full-item-main'
        );

        classGElemenets.forEach(classGElemenet => {
          let classGJson = {};
          try {
            classGJson.name =
              classGElemenet.querySelector('h2.cldt-summary-makemodel')
                .innerText +
              ' ' +
              classGElemenet.querySelector('h2.cldt-summary-version').innerText;

            classGJson.price = classGElemenet.querySelector(
              'span.cldt-price'
            ).innerText;

            //TODO:page link, need to confirm format
            classGJson.link = classGElemenet
              .querySelector('div.cldt-summary-titles')
              .getElementsByTagName('a')[0]
              .getAttribute('href');
          } catch (exception) {}
          classGs.push(classGJson);
        });
        return classGs;
      });
      hasedInventory = classGData.reduce((acc, next) => {
        if (!inventory.hasOwnProperty(next.link)) {
          console.log('in acc block');
          acc = { ...acc, ...getHasedVehicleJson(next) };
        }
        return acc;
      }, {});

      if (Object.keys(hasedInventory).length > 0) {
        inventory = { ...inventory, ...hasedInventory };
        writeInventoryAsJson(inventory);
      }

      await browser.close();
    })();
  }
  return scraperFunctionForUrl;
}

let doScrapeAutoScout24GClass = scraperAutoScout24(
  'https://www.autoscout24.pl/lst/mercedes-benz/klasa-g-(wszystkie)?sort=price&desc=0&gear=M&fuel=D&ustate=N%2CU&fregto=1995&fregfrom=1986&atype=C'
);
scraperJobs.push(doScrapeAutoScout24GClass);

let doScrapeAutoScout24Defender = scraperAutoScout24(
  'https://www.autoscout24.pl/lst/land-rover/defender?sort=age&desc=1&gear=M&fuel=D&ustate=N%2CU&size=20&page=1&pricefrom=1000&fregto=1995&fregfrom=1987&atype=C&'
);
scraperJobs.push(doScrapeAutoScout24Defender);

//all scrape jobs
module.exports = scraperJobs;
