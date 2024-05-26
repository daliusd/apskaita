export const postInvoicemailer = async (invoiceId, email) => {
  let response: Response;
  try {
    response = await fetch('/api/invoicemailer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId,
        email,
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

  return { success: true };
};
