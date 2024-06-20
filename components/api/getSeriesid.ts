export const getSeriesid = async (seriesName: string) => {
  let response: Response;

  try {
    response = await fetch('/api/seriesid/' + seriesName, {
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
  return { success: true, seriesId: responseJson.seriesId };
};
