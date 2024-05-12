import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { Database } from 'sqlite';
import {
  openDb,
  createInvoice,
  getInvoiceList,
  IInvoice,
  getInvoiceWithLineItems,
} from './db';

describe('database tests', () => {
  describe('creates invoices properly', () => {
    let db: Database;

    beforeEach(async () => {
      db = await openDb(':memory:');
    });

    afterEach(async () => {
      await db.close();
    });

    it('creates invoices', async () => {
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
      const invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoiceId);
      expect(invoices[0].seriesName).toEqual(invoice.seriesName);
      expect(invoices[0].seriesId).toEqual(invoice.seriesId);
      expect(invoices[0].created).toEqual(invoice.created);
      expect(invoices[0].price).toEqual(invoice.price);
      expect(invoices[0].buyer).toEqual(invoice.buyer);
    });

    it('creates proforma invoice', async () => {
      const invoice: IInvoice = {
        seriesName: 'ZZ',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        invoiceType: 'proforma',
        lineItems: [],
      };
      const { invoiceId } = await createInvoice(db, invoice);
      let invoices = await getInvoiceList(db, { invoiceType: 'proforma' });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoiceId);
      expect(invoices[0].seriesName).toEqual(invoice.seriesName);
      expect(invoices[0].seriesId).toEqual(invoice.seriesId);
      expect(invoices[0].created).toEqual(invoice.created);
      expect(invoices[0].price).toEqual(invoice.price);
      expect(invoices[0].buyer).toEqual(invoice.buyer);

      invoices = await getInvoiceList(db, { invoiceType: 'standard' });
      expect(invoices).toHaveLength(0);

      invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
    });

    it('creates credit invoice', async () => {
      const invoice: IInvoice = {
        seriesName: 'ZZ',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        invoiceType: 'credit',
        lineItems: [],
      };
      const { invoiceId } = await createInvoice(db, invoice);
      let invoices = await getInvoiceList(db, { invoiceType: 'credit' });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoiceId);
      expect(invoices[0].seriesName).toEqual(invoice.seriesName);
      expect(invoices[0].seriesId).toEqual(invoice.seriesId);
      expect(invoices[0].created).toEqual(invoice.created);
      expect(invoices[0].price).toEqual(invoice.price);
      expect(invoices[0].buyer).toEqual(invoice.buyer);

      invoices = await getInvoiceList(db, { invoiceType: 'standard' });
      expect(invoices).toHaveLength(0);

      invoices = await getInvoiceList(db, { invoiceType: 'proforma' });
      expect(invoices).toHaveLength(0);

      invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
    });

    it('creates invoice with line items', async () => {
      const invoice: IInvoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        email: 'dalius@haiku.lt',
        lineItems: [
          {
            name: 'test',
            unit: 'vnt.',
            amount: 1,
            price: 100,
            vat: 21,
            vatcode: 'PVM1',
          },
          {
            name: 'test2',
            unit: 'vnt.',
            amount: 2,
            price: 200,
            vat: 9,
            vatcode: 'PVM2',
          },
        ],
      };
      const { invoiceId } = await createInvoice(db, invoice);
      const retInvoice = await getInvoiceWithLineItems(db, invoiceId);
      expect(retInvoice.id).toEqual(invoiceId);
      expect(retInvoice.seriesName).toEqual(invoice.seriesName);
      expect(retInvoice.seriesId).toEqual(invoice.seriesId);
      expect(retInvoice.created).toEqual(invoice.created);
      expect(retInvoice.price).toEqual(invoice.price);
      expect(retInvoice.buyer).toEqual(invoice.buyer);
      expect(retInvoice.seller).toEqual(invoice.seller);
      expect(retInvoice.issuer).toEqual(invoice.issuer);
      expect(retInvoice.extra).toEqual(invoice.extra);
      expect(retInvoice.language).toEqual(invoice.language);
      expect(retInvoice.email).toEqual(invoice.email);

      expect(retInvoice.lineItems[0].name).toEqual('test');
      expect(retInvoice.lineItems[0].unit).toEqual('vnt.');
      expect(retInvoice.lineItems[0].amount).toEqual(1);
      expect(retInvoice.lineItems[0].price).toEqual(100);
      expect(retInvoice.lineItems[0].vat).toEqual(21);
      expect(retInvoice.lineItems[0].vatcode).toEqual('PVM1');

      expect(retInvoice.lineItems[1].name).toEqual('test2');
      expect(retInvoice.lineItems[1].unit).toEqual('vnt.');
      expect(retInvoice.lineItems[1].amount).toEqual(2);
      expect(retInvoice.lineItems[1].price).toEqual(200);
      expect(retInvoice.lineItems[1].vat).toEqual(9);
      expect(retInvoice.lineItems[1].vatcode).toEqual('PVM2');
    });

    it('Does not allow to create duplicate Invoice', async () => {
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
        lineItems: [],
      };
      let resp = await createInvoice(db, invoice);
      expect(resp.success).toBeTruthy();

      resp = await createInvoice(db, invoice);
      expect(resp.success).toBeFalsy();
    });

    it('Does not allow to create Invoice with invalid created date', async () => {
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
        lineItems: [],
      };
      let resp = await createInvoice(db, invoice);
      expect(resp.success).toBeTruthy();

      invoice.seriesId = 3;
      invoice.created = new Date(2020, 0, 30).getTime();

      resp = await createInvoice(db, invoice);
      expect(resp.success).toBeFalsy();

      invoice.created = new Date(2020, 0, 31).getTime();
      resp = await createInvoice(db, invoice);
      expect(resp.success).toBeTruthy();
    });
  });
});
