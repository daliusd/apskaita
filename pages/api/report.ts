import { NextApiRequest, NextApiResponse } from 'next';
import { sendReportMessage } from '../../utils/report-mailer';
import { errorHandler } from '../../utils/report-mailer';

const reportHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { subject, error } = req.body;

    await sendReportMessage(subject, error);

    res.json({ success: true });
  }
};

export default errorHandler(reportHandler);
