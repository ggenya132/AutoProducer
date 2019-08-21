const SGmail = require('@sendgrid/mail');
SGmail.setApiKey(require('./config').sendGridApiKey);
module.exports = (email, name) => {
  const msg = {
    to: email,
    from: 'test@example.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>'
  };
  SGmail.send(msg)
    .then(sent => {
      // Awesome Logic to check if mail was sent
    })
    .catch(console.log);
};
