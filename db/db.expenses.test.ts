import { Database } from 'sqlite';
import {
  openDb,
  createExpense,
  deleteExpense,
  getExpenseList,
  IExpense,
  updateExpense,
  getExpense,
} from './db';

describe('expenses tests', () => {
  describe('handles expenses properly', () => {
    let db: Database;

    beforeEach(async () => {
      db = await openDb(':memory:');
    });

    afterEach(async () => {
      await db.close();
    });

    it('get expense by id', async () => {
      const expense: IExpense = {
        description: 'spausdintuvas',
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        gdriveId: '123',
        webViewLink: 'view_link_1',
        webContentLink: 'content_link_1',
      };
      const { expenseId } = await createExpense(db, expense);

      const expenseFromDb = await getExpense(db, expenseId);
      expect(expenseFromDb.id).toEqual(expenseId);
      expect(expenseFromDb.description).toEqual(expense.description);
      expect(expenseFromDb.created).toEqual(expense.created);
      expect(expenseFromDb.price).toEqual(expense.price);
      expect(expenseFromDb.gdriveId).toEqual(expense.gdriveId);
      expect(expenseFromDb.webViewLink).toEqual(expense.webViewLink);
      expect(expenseFromDb.webContentLink).toEqual(expense.webContentLink);
    });

    it('get expenses by using different filters', async () => {
      const expense: IExpense = {
        description: 'spausdintuvas',
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        gdriveId: '123',
        webViewLink: 'view_link_1',
        webContentLink: 'content_link_1',
      };
      const { expenseId: expense1Id } = await createExpense(db, expense);

      expense.created = new Date(2020, 0, 30).getTime();
      expense.description = 'dažai';
      const { expenseId: expense2Id } = await createExpense(db, expense);

      expense.created = new Date(2020, 0, 29).getTime();
      expense.description = 'lazerinis spausdintuvas';
      const { expenseId: expense3Id } = await createExpense(db, expense);

      let expenses = await getExpenseList(db, {});
      expect(expenses).toHaveLength(3);
      expect(expenses[0].id).toEqual(expense1Id);
      expect(expenses[1].id).toEqual(expense2Id);
      expect(expenses[2].id).toEqual(expense3Id);

      // Date tests

      expenses = await getExpenseList(db, {
        minDate: new Date(2020, 0, 31).getTime(),
      });
      expect(expenses).toHaveLength(1);
      expect(expenses[0].id).toEqual(expense1Id);

      expenses = await getExpenseList(db, {
        maxDate: new Date(2020, 0, 29).getTime(),
      });
      expect(expenses).toHaveLength(1);
      expect(expenses[0].id).toEqual(expense3Id);

      expenses = await getExpenseList(db, {
        minDate: new Date(2020, 0, 30).getTime(),
        maxDate: new Date(2020, 0, 30).getTime(),
      });
      expect(expenses).toHaveLength(1);
      expect(expenses[0].id).toEqual(expense2Id);

      // description test

      expenses = await getExpenseList(db, {
        description: 'spausdintuvas',
      });
      expect(expenses).toHaveLength(2);
      expect(expenses[0].id).toEqual(expense1Id);
      expect(expenses[1].id).toEqual(expense3Id);
    });

    it('update expense', async () => {
      const expense: IExpense = {
        description: 'spausdintuvas',
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        gdriveId: '123',
        webViewLink: 'view_link_1',
        webContentLink: 'content_link_1',
      };
      const { expenseId } = await createExpense(db, expense);

      expense.created = new Date(2020, 0, 30).getTime();
      expense.description = 'dažai';
      expense.price = 101;

      await updateExpense(db, expenseId, expense);

      const expenses = await getExpenseList(db, {});
      expect(expenses).toHaveLength(1);
      expect(expenses[0].id).toEqual(expenseId);
      expect(expenses[0].created).toEqual(expense.created);
      expect(expenses[0].description).toEqual(expense.description);
      expect(expenses[0].price).toEqual(expense.price);
    });

    it('deletes expense', async () => {
      const expense: IExpense = {
        description: 'spausdintuvas',
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        gdriveId: '123',
        webViewLink: 'view_link_1',
        webContentLink: 'content_link_1',
      };
      const { expenseId } = await createExpense(db, expense);
      await deleteExpense(db, expenseId);
      const expenses = await getExpenseList(db, {});
      expect(expenses).toHaveLength(0);
    });
  });
});
