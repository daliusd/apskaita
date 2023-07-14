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
        query: {
          from,
          to,
          seriesName,
          personalInfo,
          location,
          activityName,
          includeExpenses,
        },
      } = req;

      const journal = await getDataForJournal(
        db,
        from && parseInt(defaultOrFirst(from), 10),
        to && parseInt(defaultOrFirst(to), 10),
        defaultOrFirst(seriesName),
        includeExpenses === 'true',
      );

      const pdfInfo = {
        journal,
        personalInfo: defaultOrFirst(personalInfo),
        location: defaultOrFirst(location),
        activityName: defaultOrFirst(activityName),
      };

      return new Promise<void>((resolve) =>
        generateJournalPdf(res, pdfInfo, resolve),
      );
    });
  }
};

export default errorHandler(handler);
