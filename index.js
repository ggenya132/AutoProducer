var AWS = require('aws-sdk');
const puppeteer = require('puppeteer');
AWS.config.loadFromPath('./config.json');

const doScrape = function() {
  const endpoint =
    'https://www.otomoto.pl/osobowe/mercedes-benz/g-klasa/od-1960/?search%5Bfilter_float_price%3Afrom%5D=2000&search%5Bfilter_float_price%3Ato%5D=200000&search%5Bfilter_float_year%3Ato%5D=1994&search%5Bfilter_enum_fuel_type%5D=diesel&search%5Bnew_used%5D=on';
  (async () => {
    console.log({ puppeteer });
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    console.log('sup');
    await page.goto(endpoint);
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
    console.log({ classGData });
    let parsedString = classGData
      .map(({ name, price, link }) => {
        return `Model: ${name}, Price:${price}, Link: ${link}`;
      })
      .join(' ')
      .trim();

    const firstCar = classGData[0];
    const TopicArn = 'arn:aws:sns:us-east-1:674309893935:AutoTopic';
    const smsString = `Link: ${firstCar.link}`;
    var sns = new AWS.SNS();
    var params = {
      Message: parsedString,
      Subject: 'Test SNS Fraom Lambda',
      TopicArn
    };
    sns.publish(params, function(err, data) {
      if (err) console.log(err, err.stack);
      // an error occurred
      else console.log(data); // successful response
    });
    await browser.close();
  })();
};
doScrape();
