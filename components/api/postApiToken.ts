export const postApiToken = async () => {
  let response: Response;
  try {
    response = await fetch('/api/apitoken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  } catch {}

  if (!response || !response.ok) {
    return { success: false };
  }

  const message = await response.json();
  if (!message.success) {
    return { success: false };
  }

  return { success: true, token: message.token };
};
