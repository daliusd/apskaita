import { IInvoice } from '../../db/db';

export const postInvoices = async (invoice: IInvoice, code: string) => {
  let response: Response;

  response = await fetch('/api/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invoice,
      code,
    }),
  });

  const message = 'Klaida kuriant sąskaitą faktūrą.';

  if (!response || !response.ok) {
    return { success: false, message };
  }

  const responseJson = await response.json();
  if (!responseJson.success) {
    return { success: false, message };
  }

  return { success: true, invoiceId: responseJson.invoiceId };
};
