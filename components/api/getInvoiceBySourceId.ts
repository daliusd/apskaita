export const getInvoiceBySourceId = async (sourceId: string | number) => {
  let response: Response;

  response = await fetch(`/api/initial?sourceId=${sourceId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response || !response.ok) {
    return { success: false };
  }

  const responseJson = await response.json();
  return { success: true, invoice: responseJson.invoice };
};
