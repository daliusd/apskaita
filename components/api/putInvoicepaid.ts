export const putInvoicepaid = async (
  invoiceId: string | number,
  paid: boolean,
) => {
  let response: Response;
  try {
    response = await fetch(`/api/invoicespaid/${invoiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paid }),
    });
  } catch {}

  if (!response || !response.ok || !(await response.json()).success) {
    return false;
  }

  return true;
};
