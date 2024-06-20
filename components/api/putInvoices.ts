import { IInvoice } from '../../db/db';

export const putInvoices = async (
  invoiceId: string | number,
  invoice: IInvoice,
) => {
  let response: Response;

  try {
    response = await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });
  } catch {}

  if (!response || !response.ok || !(await response.json()).success) {
    return { success: false, message: 'Klaida kečiant sąskaitą faktūrą.' };
  }

  return { success: true, invoiceId };
};
