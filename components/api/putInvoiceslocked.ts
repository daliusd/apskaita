export const putInvoiceslocked = async (
  invoiceId: string | number,
  locked: boolean,
) => {
  let response: Response;
  try {
    response = await fetch(`/api/invoiceslocked/${invoiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locked }),
    });
  } catch {}

  if (!response || !response.ok || !(await response.json()).success) {
    return false;
  }

  return true;
};
