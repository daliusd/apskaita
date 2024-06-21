export const postProPlan = async (user: string, months: number | string) => {
  let response: Response;
  try {
    response = await fetch('/api/proplan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, months }),
    });
  } catch {}

  if (!response || !response.ok) {
    return { success: false };
  }

  const message = await response.json();
  if (!message.success) {
    return { success: false };
  }

  return { success: true, endDate: message.endDate };
};
