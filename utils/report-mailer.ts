import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

export async function sendReportMessage(subject, error) {
  if (!process.env.SMTP_HOST) {
    throw Error('SMTP not configured.');
  }

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
    subject: `${subject}: ${error.message}`,
    text: error.stack,
  });
}

export function errorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      await handler(req, res);
    } catch (err) {
      await sendReportMessage(`haiku.lt server side`, err);
      throw err;
    }
  };
}
