export const getInvoiceBySourceId = async (sourceId: string | number) => {
  let response: Response;

  try {
    response = await fetch(`/api/initial?sourceId=${sourceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {}

  if (!response || !response.ok) {
    return { success: false };
  }

  const responseJson = await response.json();
  return { success: true, invoice: responseJson.invoice };
};
