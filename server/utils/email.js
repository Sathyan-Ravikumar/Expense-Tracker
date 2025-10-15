const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const templateName = options.templateName || 'genericTemplate.html';
    const templatePath = path.join(__dirname, `../views/email-templates/${templateName}`);
    let html = fs.readFileSync(templatePath, 'utf-8');
    html = html.replace('{{message}}', options.message);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      html,
    });

    console.log(`✅ Email sent to ${options.email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = sendEmail;
