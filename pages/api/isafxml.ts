import { NextApiRequest, NextApiResponse } from 'next';

import { dbWrapper } from '../../db/apiwrapper';
import { defaultOrFirst } from '../../utils/query';
import { errorHandler } from '../../utils/report-mailer';
import { generateISAFXml } from '../../utils/isaf';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return dbWrapper(req, res, async (db) => {
      const {
        query: { from, to, seriesName, registrationNumber },
      } = req;

      const xml = await generateISAFXml({
        db,
        from: from && parseInt(defaultOrFirst(from), 10),
        to: to && parseInt(defaultOrFirst(to), 10),
        seriesName: defaultOrFirst(seriesName),
        registrationNumber: defaultOrFirst(registrationNumber),
      });

      const bufxml = Buffer.from(xml, 'utf8');
      res
        .writeHead(200, {
          'Content-Length': bufxml.length,
          'Content-Type': 'application/xml',
          'Content-disposition': 'attachment;filename=isaf.xml',
        })
        .end(bufxml);
    });
  }
};

export default errorHandler(handler);
