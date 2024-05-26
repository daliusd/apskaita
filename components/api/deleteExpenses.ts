export const deleteExpenses = async (expenseId: number) => {
    let response: Response;
    try {
      response = await fetch('/api/expenses/' + expenseId, {
        method: 'DELETE',
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      return false;
    }

    return true;
}
