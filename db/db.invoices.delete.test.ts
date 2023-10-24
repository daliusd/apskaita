import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { Database } from 'sqlite';
import {
  openDb,
  createInvoice,
  getInvoiceList,
  IInvoice,
  deleteInvoice,
} from './db';

describe('database tests', () => {
  describe('gets information about invoices', () => {
    let db: Database;

    beforeEach(async () => {
      db = await openDb(':memory:');
    });

    afterEach(async () => {
      await db.close();
    });

    it('deletes invoice', async () => {
      const invoice: IInvoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        lineItems: [],
      };
      const { invoiceId } = await createInvoice(db, invoice);
      await deleteInvoice(db, invoiceId);
      const invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(0);
    });
  });
});
