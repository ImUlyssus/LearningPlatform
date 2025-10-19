const nodemailer = require('nodemailer');
const { WEBSITE_NAME } = require('./constants');

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465, // or 587
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_EMAIL_PASSWORD // mailbox password
  },
});

const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: `${WEBSITE_NAME} <${process.env.MY_EMAIL}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { sendEmail };
