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
  validCreatedDate,
  validSeriesName,
  validSeriesNumber,
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

    it('Validates series name', async () => {
      expect(await validSeriesName(db, 'VSN', 'proforma')).toBeTruthy();
      expect(await validSeriesName(db, 'VSN', 'credit')).toBeTruthy();
    });

    it('Validates serie name for matching name', async () => {
      const invoice: IInvoice = {
        seriesName: 'VSN',
        invoiceType: 'standard',
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

      expect(await validSeriesName(db, 'VSN', 'standard')).toBeTruthy();
      expect(await validSeriesName(db, 'VSN', 'proforma')).toBeFalsy();
      expect(await validSeriesName(db, 'VSN', 'credit')).toBeTruthy();
    });

    it('Validates serie name for matching name (proforma case)', async () => {
      const invoice: IInvoice = {
        seriesName: 'VSN',
        invoiceType: 'proforma',
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

      expect(await validSeriesName(db, 'VSN', 'standard')).toBeFalsy();
      expect(await validSeriesName(db, 'VSN', 'proforma')).toBeTruthy();
      expect(await validSeriesName(db, 'VSN', 'credit')).toBeFalsy();
    });

    it('Validates serie name for matching name excluding existing invoice id', async () => {
      const invoice: IInvoice = {
        seriesName: 'VSN',
        invoiceType: 'standard',
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

      let resp = await createInvoice(db, invoice);

      expect(
        await validSeriesName(db, 'VSN', 'standard', resp.invoiceId),
      ).toBeTruthy();
      expect(
        await validSeriesName(db, 'VSN', 'proforma', resp.invoiceId),
      ).toBeTruthy();
      expect(
        await validSeriesName(db, 'VSN', 'credit', resp.invoiceId),
      ).toBeTruthy();
    });

    it('Validates serie number', async () => {
      expect(await validSeriesNumber(db, 'VSN', 1)).toBeTruthy();
    });

    it('Validates serie number for matching serieno', async () => {
      const invoice: IInvoice = {
        seriesName: 'VSN',
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

      expect(await validSeriesNumber(db, 'VSN', 123)).toBeFalsy();
    });

    it('Validates serie number excluding specific invoice', async () => {
      const invoice: IInvoice = {
        seriesName: 'VSN',
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

      const { invoiceId } = await createInvoice(db, invoice);

      expect(await validSeriesNumber(db, 'VSN', 123, invoiceId)).toBeTruthy();
    });

    it('Validates created data', async () => {
      const created = new Date(2020, 0, 31).getTime();
      const invoice: IInvoice = {
        seriesName: 'VCD',
        seriesId: 123,
        created,
        price: 500,
        buyer: 'Buyer',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        lineItems: [],
      };

      await createInvoice(db, invoice);

      let resp = await validCreatedDate(
        db,
        'VCD',
        124,
        new Date(2020, 0, 30).getTime(),
      );
      expect(resp.success).toBeFalsy();
      expect(resp.minValidDate).toEqual(created);

      resp = await validCreatedDate(
        db,
        'VCD',
        124,
        new Date(2020, 1, 1).getTime(),
      );
      expect(resp.success).toBeTruthy();

      resp = await validCreatedDate(db, 'VCD', 124, created);
      expect(resp.success).toBeTruthy();

      resp = await validCreatedDate(
        db,
        'VCD',
        122,
        new Date(2020, 1, 1).getTime(),
      );
      expect(resp.success).toBeFalsy();
      expect(resp.maxValidDate).toEqual(created);

      resp = await validCreatedDate(
        db,
        'VCD',
        122,
        new Date(2020, 0, 30).getTime(),
      );
      expect(resp.success).toBeTruthy();

      resp = await validCreatedDate(db, 'VCD', 122, created);
      expect(resp.success).toBeTruthy();
    });

    it('Validates created data excluding specific invoice', async () => {
      const created = new Date(2020, 0, 31).getTime();
      const invoice: IInvoice = {
        seriesName: 'VCD',
        seriesId: 123,
        created,
        price: 500,
        buyer: 'Buyer',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        lineItems: [],
      };

      const { invoiceId } = await createInvoice(db, invoice);

      let resp = await validCreatedDate(
        db,
        'VCD',
        124,
        new Date(2020, 0, 30).getTime(),
        invoiceId,
      );
      expect(resp.success).toBeTruthy();

      resp = await validCreatedDate(
        db,
        'VCD',
        122,
        new Date(2020, 1, 1).getTime(),
        invoiceId,
      );
      expect(resp.success).toBeTruthy();
    });
  });
});
