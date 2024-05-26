export const deleteUserdata = async () => {
    let response: Response;
    try {
      response = await fetch('/api/userdata', {
        method: 'DELETE',
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      return false;
    }

    return true;
}
