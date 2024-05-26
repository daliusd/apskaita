import { IInvoice } from '../../db/db';

export const getInvoice = async (invoiceId: string | number) => {
  let response: Response;

  response = await fetch(`/api/initial?id=${invoiceId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response || !response.ok) {
    return { success: false };
  }

  const responseJson = await response.json();
  return { success: true, invoice: responseJson.invoice as IInvoice };
};
