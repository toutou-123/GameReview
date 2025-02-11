const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendMail = async (from, to, subject, text, html, attachments = []) => {
  const mailOptions = {
    from: from,
    to: process.env.EMAIL_USERNAME,
    subject: subject,
    text: text,
    html: html,
    attachments: attachments
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ' + error);
  }
};

module.exports = { sendMail }
