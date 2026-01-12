import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }) {
  if (!process.env.EMAIL_SERVER || !process.env.EMAIL_FROM) {
    throw new Error('EMAIL_SERVER and EMAIL_FROM must be set in .env');
  }

  // Parse EMAIL_SERVER URL
  // Example: smtps://user:pass@host:465
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

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  console.log('Email sent: %s', to);
  return info;
}
