import path from 'path';
import { auth, gmail } from '@googleapis/gmail';
const MailComposer = require('nodemailer/lib/mail-composer'); // eslint-disable-line

export async function sendEmail({
  accessToken,
  from,
  to,
  subject,
  text,
  pdfname,
  filename,
}) {
  const oAuth2Client = new auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET,
  );

  oAuth2Client.setCredentials({
    access_token: accessToken,
  });
  const gmailInstance = gmail({ version: 'v1', auth: oAuth2Client });

  const mail = new MailComposer({
    from,
    to,
    subject,
    text,
    attachments: [
      {
        filename,
        path: path.join(process.env.USER_DATA_PATH, 'invoices', pdfname),
      },
    ],
  });

  const raw = (await mail.compile().build()).toString('base64');

  const sendresp = await gmailInstance.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
    },
  });

  if (sendresp.status !== 200) {
    throw new Error(sendresp.statusText);
  }
}
