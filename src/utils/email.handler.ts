import nodemailer, { SendMailOptions } from 'nodemailer';

export const sendMail = (options: SendMailOptions) => {
  // create transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST ?? '',
    port: Number(process.env.EMAIL_PORT) || 2525,
    auth: {
      user: process.env.EMAIL_USER ?? '',
      pass: process.env.EMAIL_PASSWORD ?? '',
    },
  });

  // define email options

  const mailOptions = {
    from: 'Jonas Schmedtmann <hello@jonas.io›',
    to: options.to,
    subject: options.subject,
    text: options.text,
    // html:
  };
  // send mail
  return transporter.sendMail(mailOptions);
};
