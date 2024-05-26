export const putInvoicespdf = async (invoiceId) => {
  let responsePdf: Response;
  try {
    responsePdf = await fetch('/api/invoicespdf/' + invoiceId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  } catch {}

  if (!responsePdf || !responsePdf.ok || !(await responsePdf.json()).success) {
    return false;
  }

  return true;
};
