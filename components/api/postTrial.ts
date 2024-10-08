export const postTrial = async (code: string) => {
  let response: Response;

  try {
    response = await fetch('/api/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
  } catch {}

  const message = 'Klaida užsakant Pro plano išbandymą.';

  if (!response || !response.ok) {
    return { success: false, message };
  }

  const responseJson = await response.json();
  if (!responseJson.success) {
    return { success: false, message };
  }

  return { success: true };
};
