import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const {
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
  } = process.env;
  const port = Number.parseInt(SMTP_PORT, 10);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
  });
};
