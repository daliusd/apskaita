import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { Database } from 'sqlite';
import {
  openDb,
  createInvoice,
  getInvoiceList,
  IInvoice,
  getInvoiceWithLineItems,
  getInvoicesCount,
  getInvoicesSummary,
  getLastSellerInformation,
  getNextSeriesId,
  getSeriesNameByType,
  getUniqueBuyers,
  getUniqueLineItemsNames,
  getUniqueSeriesNames,
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

    it('returns proper series name by type', async () => {
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
        invoiceType: 'standard',
        lineItems: [],
      };
      await createInvoice(db, invoice);
      invoice.invoiceType = 'proforma';
      invoice.seriesName = 'AA';
      await createInvoice(db, invoice);

      expect(await getSeriesNameByType(db, 'standard')).toBe('ZZ');
      expect(await getSeriesNameByType(db, 'proforma')).toBe('AA');
      expect(await getSeriesNameByType(db, 'credit')).toBe('ZZ');
    });

    it('returns invoices on the same date sorted by series number', async () => {
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
      await createInvoice(db, invoice);

      invoice.seriesId = 3;
      await createInvoice(db, invoice);

      invoice.seriesId = 2;
      await createInvoice(db, invoice);

      const invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(3);
      expect(invoices[0].seriesId).toEqual(3);
      expect(invoices[1].seriesId).toEqual(2);
      expect(invoices[2].seriesId).toEqual(1);
    });

    it('returns correct invoices count based on parameters', async () => {
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
        invoiceType: 'standard',
        lineItems: [],
      };
      await createInvoice(db, invoice);

      invoice.invoiceType = 'proforma';
      invoice.seriesName = 'AA';
      invoice.created = new Date(2020, 1, 28).getTime();
      invoice.buyer = 'Antanukas';
      await createInvoice(db, invoice);

      expect(await getInvoicesCount(db, {})).toBe(2);
      expect(await getInvoicesCount(db, { invoiceType: 'proforma' })).toBe(1);
      expect(
        await getInvoicesCount(db, { minDate: new Date(2020, 0, 1).getTime() }),
      ).toBe(2);
      expect(
        await getInvoicesCount(db, { minDate: new Date(2020, 1, 1).getTime() }),
      ).toBe(1);
      expect(
        await getInvoicesCount(db, { maxDate: new Date(2020, 1, 1).getTime() }),
      ).toBe(1);
      expect(
        await getInvoicesCount(db, { maxDate: new Date(2020, 2, 1).getTime() }),
      ).toBe(2);
      expect(await getInvoicesCount(db, { seriesName: 'AA' })).toBe(1);
      expect(await getInvoicesCount(db, { buyer: 'Buyer' })).toBe(1);
      expect(await getInvoicesCount(db, { paid: 1 })).toBe(0);
      expect(await getInvoicesCount(db, { paid: 0 })).toBe(2);
    });

    it('returns correct invoices summary based on parameters', async () => {
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
        invoiceType: 'standard',
        lineItems: [],
      };
      await createInvoice(db, invoice);

      invoice.invoiceType = 'proforma';
      invoice.seriesName = 'AA';
      invoice.created = new Date(2020, 1, 28).getTime();
      invoice.buyer = 'Antanukas';
      await createInvoice(db, invoice);

      expect(await getInvoicesSummary(db, {})).toStrictEqual([
        {
          cnt: 1,
          flags: 0,
          paid: 0,
          price: 100,
          vat: 0,
        },
        {
          cnt: 1,
          flags: 1,
          paid: 0,
          price: 100,
          vat: 0,
        },
      ]);
    });

    it('returns undefined if there is no invoice', async () => {
      const retInvoice = await getInvoiceWithLineItems(db, -1);
      expect(retInvoice).toBeUndefined();
    });

    it('returns correct last seller information', async () => {
      expect((await getLastSellerInformation(db, 'DD', 'lt')).seller).toBe('');

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
      expect((await getLastSellerInformation(db, 'DDX', 'en')).seller).toBe(
        'Seller',
      );

      invoice.seriesId = 3;
      invoice.seller = 'Seller_EN';
      invoice.issuer = 'Issuer_EN';
      invoice.extra = 'Extra_EN';
      invoice.language = 'en';
      resp = await createInvoice(db, invoice);
      expect(resp.success).toBeTruthy();

      expect((await getLastSellerInformation(db, 'DD', 'lt')).seller).toBe(
        'Seller',
      );
      expect((await getLastSellerInformation(db, 'DD', 'en')).seller).toBe(
        'Seller_EN',
      );
      expect((await getLastSellerInformation(db, 'DDX', 'lt')).seller).toBe(
        'Seller',
      );
    });

    it('Return next seriesId = 1 for non existing serie', async () => {
      const seriesId = await getNextSeriesId(db, 'AB');
      expect(seriesId).toEqual(1);
    });

    it('Return correct next seriesId for existing serie', async () => {
      const invoice: IInvoice = {
        seriesName: 'ZZ',
        seriesId: 123,
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
      const seriesId = await getNextSeriesId(db, 'ZZ');
      expect(seriesId).toEqual(124);
    });
  });
});
