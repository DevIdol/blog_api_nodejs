const nodemailer = require('nodemailer')

const SendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: 'ucsk.mm@gmail.com',
        pass: 'zcwjnpznkuwrddnq',
      },
    })
    await transporter.sendMail({
      from: 'ucsk.mm@gmail.com',
      to: email,
      subject: subject,
      text: text,
    })
    console.log('Email sent successfully!...')
  } catch (error) {
    console.log('Email not sent...', error)
  }
}
module.exports = SendEmail
