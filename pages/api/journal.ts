import { NextApiRequest, NextApiResponse } from 'next';

import { dbWrapper } from '../../db/apiwrapper';
import { getDataForJournal } from '../../db/db';
import { defaultOrFirst } from '../../utils/query';
import { errorHandler } from '../../utils/report-mailer';
import { generateJournalPdf } from '../../utils/pdfjournal';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { from, to },
      } = req;

      const journal = await getDataForJournal(
        db,
        from && parseInt(defaultOrFirst(from), 10),
        to && parseInt(defaultOrFirst(to), 10),
      );

      return res.json({ journal });
    });
  } else if (req.method === 'POST') {
    const pdfInfo = req.body;
    return new Promise<void>((resolve) =>
      generateJournalPdf(res, pdfInfo, resolve),
    );
  }
};

export default errorHandler(handler);
