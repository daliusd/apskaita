export const getSeriesid = async (seriesName: string) => {
  let response: Response;

  response = await fetch('/api/seriesid/' + seriesName, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response || !response.ok) {
    return { success: false };
  }

  const responseJson = await response.json();
  return { success: true, seriesId: responseJson.seriesId };
};
