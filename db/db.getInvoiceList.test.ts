import { Database } from 'sqlite';
import { openDb, createInvoice, getInvoiceList, IInvoice } from './db';

describe('database tests', () => {
  describe('handles invoices properly', () => {
    let db: Database;

    beforeEach(async () => {
      db = await openDb(':memory:');
    });

    afterEach(async () => {
      await db.close();
    });

    it('get invoices by using different filters', async () => {
      const invoice: IInvoice = {
        seriesName: 'DD',
        seriesId: 2,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        paid: 1,
        lineItems: [],
      };
      const { invoiceId: invoice1Id } = await createInvoice(db, invoice);

      invoice.created = new Date(2020, 0, 30).getTime();
      invoice.seriesId = 1;
      invoice.buyer = 'BuyerA2';
      const { invoiceId: invoice2Id } = await createInvoice(db, invoice);

      invoice.created = new Date(2020, 0, 29).getTime();
      invoice.seriesName = 'AA';
      invoice.buyer = 'BuyerA3';
      invoice.paid = 0;
      const { invoiceId: invoice3Id } = await createInvoice(db, invoice);

      let invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(3);
      expect(invoices[0].id).toEqual(invoice1Id);
      expect(invoices[1].id).toEqual(invoice2Id);
      expect(invoices[2].id).toEqual(invoice3Id);

      // Date tests

      invoices = await getInvoiceList(db, {
        minDate: new Date(2020, 0, 31).getTime(),
      });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoice1Id);

      invoices = await getInvoiceList(db, {
        maxDate: new Date(2020, 0, 29).getTime(),
      });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoice3Id);

      invoices = await getInvoiceList(db, {
        minDate: new Date(2020, 0, 30).getTime(),
        maxDate: new Date(2020, 0, 30).getTime(),
      });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoice2Id);

      // seriesName test

      invoices = await getInvoiceList(db, {
        seriesName: 'AA',
      });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoice3Id);

      // buyer test

      invoices = await getInvoiceList(db, {
        buyer: 'BuyerA',
      });
      expect(invoices).toHaveLength(2);
      expect(invoices[0].id).toEqual(invoice2Id);
      expect(invoices[1].id).toEqual(invoice3Id);

      // paid test

      invoices = await getInvoiceList(db, {
        paid: 1,
      });
      expect(invoices).toHaveLength(2);
      expect(invoices[0].id).toEqual(invoice1Id);
      expect(invoices[1].id).toEqual(invoice2Id);

      invoices = await getInvoiceList(db, {
        paid: 0,
      });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoice3Id);

      // Multi params tests

      invoices = await getInvoiceList(db, {
        buyer: 'BuyerA',
        paid: 1,
      });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoice2Id);

      invoices = await getInvoiceList(db, {
        minDate: new Date(2020, 0, 30).getTime(),
        buyer: 'BuyerA',
      });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoice2Id);
    });
  });
});
