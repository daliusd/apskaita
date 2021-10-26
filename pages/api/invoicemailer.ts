import { NextApiRequest, NextApiResponse } from 'next';

// import { init } from '../../utils/sentry';
//
// init();

import {
  changeInvoiceLockedStatus,
  changeInvoiceSentStatus,
  getInvoiceWithLineItems,
  getSetting,
  updateInvoice,
} from '../../db/db';

import { defaultEmailSubject, defaultEmailTemplate } from '../../utils/email';
import { dbWrapper } from '../../db/apiwrapper';
import { sendEmail } from '../../utils/gmail';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return dbWrapper(req, res, async (db, session) => {
      const invoice = await getInvoiceWithLineItems(
        db,
        parseInt(req.body.invoiceId),
      );
      const email = req.body.email;

      if (!email && !invoice.email) {
        return res.json({
          success: false,
          message: 'Nurodykite pirkėjo el.pašto adresą sąkaitoje faktūroje.',
        });
      }

      const language = invoice.language;

      const zeroes = await getSetting(db, 'zeroes');
      let seriesId = invoice.seriesId.toString();
      if (zeroes) {
        seriesId = seriesId.padStart(zeroes, '0');
      }
      const invoiceNo = `${invoice.seriesName}/${seriesId}`;

      let subject =
        (await getSetting(
          db,
          `emailsubject${language === 'lt' ? '' : '_en'}`,
        )) || defaultEmailSubject[language];
      subject = subject.replace('{{sfnr}}', invoiceNo);

      const template =
        (await getSetting(
          db,
          `emailtemplate${language === 'lt' ? '' : '_en'}`,
        )) || defaultEmailTemplate[language];
      const text = template
        .replace(/{{išrašė}}/g, invoice.issuer)
        .replace(/{{sfnr}}/g, invoiceNo);

      if (email && invoice.email !== email) {
        invoice.email = email;
        await updateInvoice(db, invoice.id, invoice);
      }

      await sendEmail({
        accessToken: session.accessToken as string,
        from: session.user.email,
        to: invoice.email,
        subject,
        text,
        filename: invoiceNo.replace('/', '') + '.pdf',
        pdfname: invoice.pdfname,
      });

      await changeInvoiceLockedStatus(db, invoice.id, true);
      await changeInvoiceSentStatus(db, invoice.id, true);

      res.json({ success: true });
    });
  }
};
