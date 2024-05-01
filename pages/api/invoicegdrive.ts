import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

import {
  changeInvoiceGDriveId,
  getInvoiceWithLineItems,
  getSetting,
} from '../../db/db';

import {
  createFileFromSystem,
  GDriveInfo,
  getDrive,
  getOrCreateFolder,
} from '../../utils/gdrive';

import { dbWrapper } from '../../db/apiwrapper';
import { errorHandler } from '../../utils/report-mailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return dbWrapper(req, res, async (db, session) => {
      const invoice = await getInvoiceWithLineItems(
        db,
        parseInt(req.body.invoiceId),
      );

      const zeroes = await getSetting(db, 'zeroes');
      let seriesId = invoice.seriesId.toString();
      if (zeroes) {
        seriesId = seriesId.padStart(zeroes, '0');
      }
      const invoiceNo = `${invoice.seriesName}${seriesId}`;

      let gdriveInfo: GDriveInfo = {
        id: null,
        webViewLink: null,
        webContentLink: null,
      };

      const drive = getDrive((session as any).accessToken as string);

      const createdDate = new Date(invoice.created);
      const year = createdDate.getFullYear().toString();

      const haikuFolderId = await getOrCreateFolder(drive, 'Haiku.lt');
      const invoiceFolderId = await getOrCreateFolder(
        drive,
        'Pajamos',
        haikuFolderId,
      );
      const yearFolderId = await getOrCreateFolder(
        drive,
        year,
        invoiceFolderId,
      );

      const fullFileName = path.join(
        process.env.USER_DATA_PATH,
        'invoices',
        invoice.pdfname,
      );

      gdriveInfo = await createFileFromSystem(
        drive,
        fullFileName,
        `${invoiceNo}.pdf`,
        yearFolderId,
      );

      changeInvoiceGDriveId(db, invoice.id, gdriveInfo.id);

      res.json({ success: true, gdriveId: gdriveInfo.id });
    });
  }
};

export default errorHandler(handler);
