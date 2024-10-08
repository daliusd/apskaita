import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

export async function sendReportMessage(subject, error, req) {
  if (!process.env.SMTP_HOST) {
    console.error('Error message: ', error.message);
    console.error('Error stack: ', error.stack);
    console.error('Error content: ', error?.content);
    console.error('Method: ' + req.method);
    console.error(
      'URL: ' + JSON.stringify(req.originalUrl || req.url, null, 2),
    );
    console.error('Query: ' + JSON.stringify(req.query, null, 2));
    console.error('Body:\n\n' + JSON.stringify(req.body, null, 2));
    return;
  }

  // NOTE: this error is related to adblock (or whatever). Let's ignore it.
  if (error.message === 'Cannot redefine property: googletag') {
    return;
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

  let text = '';
  try {
    text += 'Method: ' + req.method + '\n\n';
  } catch {}

  try {
    text +=
      'URL:\n\n' + JSON.stringify(req.originalUrl || req.url, null, 2) + '\n\n';
  } catch {}

  try {
    text += 'Query:\n\n' + JSON.stringify(req.query, null, 2) + '\n\n';
  } catch {}

  try {
    text += 'Body:\n\n' + JSON.stringify(req.body, null, 2) + '\n\n';
  } catch {}

  try {
    text += 'Error:\n\n' + error.stack + '\n\n';
  } catch {}

  try {
    text += 'Content:\n\n' + error.content + '\n\n';
  } catch {}

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
    subject: `${subject}: ${error.message}`,
    text,
  });
}

export function errorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      await handler(req, res);
    } catch (err) {
      await sendReportMessage(`haiku.lt server side`, err, req);
      throw err;
    }
  };
}
