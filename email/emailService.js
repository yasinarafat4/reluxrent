const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

function compileTemplate(templateName, data) {
  const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, 'utf8');
  const template = handlebars.compile(source);
  return template(data);
}

async function sendEmail({ to, subject, templateName, data }) {
  const html = compileTemplate(templateName, data);

  const url = new URL(process.env.EMAIL_SERVER);

  const transporter = nodemailer.createTransport({
    host: url.hostname,
    port: parseInt(url.port),
    secure: url.protocol === 'smtps:',
    auth: {
      user: decodeURIComponent(url.username),
      pass: decodeURIComponent(url.password),
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent to ${to}`);
}

module.exports = { sendEmail };
