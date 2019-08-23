const SGmail = require('@sendgrid/mail');
SGmail.setApiKey(require('./config').sendGridApiKey);
module.exports = (emails, html) => {
  emails.forEach(email => {
    const msg = {
      to: email,
      from: 'scraper@babyneedsagwagon.com',
      subject: 'Sending with SendGrid is Fun',
      text: 'test',
      html
    };
    SGmail.send(msg)
      .then(sent => {
        // Awesome Logic to check if mail was sent
      })
      .catch(console.log);
  });
};
