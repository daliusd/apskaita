import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Database } from 'sqlite';
import {
  IInvoice,
  changeInvoiceLockedStatus,
  changeInvoicePaidStatus,
  changeInvoiceSentStatus,
  createInvoice,
  getInvoiceList,
  getInvoiceWithLineItems,
  openDb,
  updateInvoice,
} from './db';

describe('database tests', () => {
  describe('updates invoices', () => {
    let db: Database;

    beforeEach(async () => {
      db = await openDb(':memory:');
    });

    afterEach(async () => {
      await db.close();
    });

    it('updates invoice', async () => {
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
        lineItems: [
          { name: 'test', unit: 'vnt.', amount: 1, price: 100 },
          { name: 'test2', unit: 'vnt.', amount: 2, price: 200 },
        ],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.seriesName = 'DE';
      invoice.seriesId = 2;
      invoice.created = new Date(2020, 1, 31).getTime();
      invoice.price = 200;
      invoice.buyer = 'Buyer2';
      invoice.seller = 'Seller2';
      invoice.issuer = 'Issuer2';
      invoice.extra = 'Extra2';
      invoice.language = 'en';
      invoice.email = 'dalius@haiku.lt';
      invoice.lineItems = [
        { name: 'test3', unit: 'vnt.', amount: 1, price: 20, vat: 21 },
        { name: 'test4', unit: 'vnt.', amount: 3, price: 60, vat: 9 },
      ];

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeTruthy();

      const invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
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

      expect(retInvoice.lineItems.length).toEqual(2);

      expect(retInvoice.lineItems[0].name).toEqual('test3');
      expect(retInvoice.lineItems[0].unit).toEqual('vnt.');
      expect(retInvoice.lineItems[0].amount).toEqual(1);
      expect(retInvoice.lineItems[0].price).toEqual(20);
      expect(retInvoice.lineItems[0].vat).toEqual(21);

      expect(retInvoice.lineItems[1].name).toEqual('test4');
      expect(retInvoice.lineItems[1].unit).toEqual('vnt.');
      expect(retInvoice.lineItems[1].amount).toEqual(3);
      expect(retInvoice.lineItems[1].price).toEqual(60);
      expect(retInvoice.lineItems[1].vat).toEqual(9);
    });

    it('does not update invoice if there is invoice with same serie number', async () => {
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
        lineItems: [
          { name: 'test', unit: 'vnt.', amount: 1, price: 100 },
          { name: 'test2', unit: 'vnt.', amount: 2, price: 200 },
        ],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.seriesId = 2;
      await createInvoice(db, invoice);

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeFalsy();
    });

    it('updates invoice when serie is not changed', async () => {
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
        lineItems: [
          { name: 'test', unit: 'vnt.', amount: 1, price: 100 },
          { name: 'test2', unit: 'vnt.', amount: 2, price: 200 },
        ],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.buyer = 'Buyer3';

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeTruthy();
    });

    it('does not update invoice if invoice date is wrong', async () => {
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
        lineItems: [],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.seriesId = 2;
      await createInvoice(db, invoice);

      invoice.seriesId = 1;
      invoice.created = new Date(2020, 1, 1).getTime();

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeFalsy();
    });

    it('updates invoice when date is changed', async () => {
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
        lineItems: [],
      };
      await createInvoice(db, invoice);

      invoice.seriesId = 3;
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.seriesId = 2;
      invoice.created = new Date(2020, 1, 1).getTime();

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeTruthy();
    });

    it('change invoice paid status', async () => {
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
        lineItems: [{ name: 'test', unit: 'vnt.', amount: 1, price: 100 }],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      await changeInvoicePaidStatus(db, invoiceId, true);

      let invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
      expect(invoices[0].paid).toEqual(1);

      await changeInvoicePaidStatus(db, invoiceId, false);

      invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
      expect(invoices[0].paid).toEqual(0);
    });

    it('change invoice locked status', async () => {
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
        lineItems: [{ name: 'test', unit: 'vnt.', amount: 1, price: 100 }],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      await changeInvoiceLockedStatus(db, invoiceId, true);

      let invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
      expect(invoices[0].locked).toEqual(1);

      await changeInvoiceLockedStatus(db, invoiceId, false);

      invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
      expect(invoices[0].locked).toEqual(0);
    });

    it('change invoice sent status', async () => {
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
        lineItems: [{ name: 'test', unit: 'vnt.', amount: 1, price: 100 }],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      await changeInvoiceSentStatus(db, invoiceId, true);

      let invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
      expect(invoices[0].sent).toEqual(1);

      await changeInvoiceSentStatus(db, invoiceId, false);

      invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
      expect(invoices[0].sent).toEqual(0);
    });
  });
});
