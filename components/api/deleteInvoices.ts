export const deleteInvoices = async (invoiceId: string) => {
  let response: Response;
  try {
    response = await fetch('/api/invoices/' + invoiceId, {
      method: 'DELETE',
    });
  } catch {}

  if (!response || !response.ok || !(await response.json()).success) {
    return false;
  }
  return true;
};
