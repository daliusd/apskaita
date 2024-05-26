export const postInvoicegdrive = async (invoiceId: string | number) => {
  let response: Response;
  try {
    response = await fetch('/api/invoicegdrive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId,
      }),
    });
  } catch {}

  if (!response || !response.ok) {
    return { success: false };
  }

  const message = await response.json();
  if (!message.success) {
    return { success: false, message: message.message };
  }

  return { success: true, gdriveId: message.gdriveId };
};
