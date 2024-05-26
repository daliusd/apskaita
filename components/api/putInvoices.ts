import { IInvoice } from '../../db/db';

export const putInvoices = async (invoiceId: string, invoice: IInvoice) => {
  let response: Response;

  response = await fetch('/api/invoices/' + invoiceId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoice),
  });

  if (!response || !response.ok || !(await response.json()).success) {
    return { success: false, message: 'Klaida kečiant sąskaitą faktūrą.' };
  }

  return { success: true, invoiceId };
};
