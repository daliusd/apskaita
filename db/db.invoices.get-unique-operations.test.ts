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
  describe('gets unique information about invoices', () => {
    let db: Database;

    beforeEach(async () => {
      db = await openDb(':memory:');
    });

    afterEach(async () => {
      await db.close();
    });

    it('gets unique serie names', async () => {
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
      invoice.seriesName = 'DA';
      await createInvoice(db, invoice);
      invoice.seriesName = 'EA';
      await createInvoice(db, invoice);

      let uniqueSerieNames = await getUniqueSeriesNames(db, '');
      expect(uniqueSerieNames).toHaveLength(3);
      expect(uniqueSerieNames).toEqual(['DA', 'DD', 'EA']);

      uniqueSerieNames = await getUniqueSeriesNames(db, 'E');
      expect(uniqueSerieNames).toHaveLength(1);
      expect(uniqueSerieNames).toEqual(['EA']);
    });

    it('gets unique serie names (taking type into account)', async () => {
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
      invoice.seriesName = 'DA';
      await createInvoice(db, invoice);
      invoice.invoiceType = 'proforma';
      invoice.seriesName = 'DP';
      await createInvoice(db, invoice);

      let uniqueSerieNames = await getUniqueSeriesNames(db, '', 'standard');
      expect(uniqueSerieNames).toHaveLength(2);
      expect(uniqueSerieNames).toEqual(['DA', 'DD']);

      uniqueSerieNames = await getUniqueSeriesNames(db, '', 'proforma');
      expect(uniqueSerieNames).toHaveLength(1);
      expect(uniqueSerieNames).toEqual(['DP']);

      uniqueSerieNames = await getUniqueSeriesNames(db, '', 'credit');
      expect(uniqueSerieNames).toHaveLength(2);
      expect(uniqueSerieNames).toEqual(['DA', 'DD']);
    });

    it('gets unique buyers', async () => {
      const invoice: IInvoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer1',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        email: '',
        lineItems: [],
      };
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      invoice.seriesId = 2;
      invoice.buyer = 'Buyer2';
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      invoice.seriesId = 3;
      invoice.buyer = 'ACME';
      invoice.email = '';
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      invoice.seriesId = 4;
      invoice.buyer = 'ACME';
      invoice.email = 'acme@acme.com';
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      let uniqueBuyers = await getUniqueBuyers(db, '');
      expect(uniqueBuyers).toHaveLength(3);
      expect(uniqueBuyers.map((item) => item.buyer)).toEqual([
        'ACME',
        'Buyer1',
        'Buyer2',
      ]);
      expect(uniqueBuyers[0].email).toEqual('acme@acme.com');
      expect(uniqueBuyers[1].email).toEqual('');
      expect(uniqueBuyers[2].email).toEqual('');

      uniqueBuyers = await getUniqueBuyers(db, 'A');
      expect(uniqueBuyers).toHaveLength(1);
      expect(uniqueBuyers[0].buyer).toEqual('ACME');
      expect(uniqueBuyers[0].email).toEqual('acme@acme.com');

      uniqueBuyers = await getUniqueBuyers(db, 'er1');
      expect(uniqueBuyers).toHaveLength(1);
      expect(uniqueBuyers[0].buyer).toEqual('Buyer1');
      expect(uniqueBuyers[0].email).toEqual('');
    });

    it('gets unique line items names', async () => {
      const invoice: IInvoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer1',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        lineItems: [
          { name: 'G1', unit: 'vnt.', amount: 1, price: 100 },
          { name: 'G2', unit: 'vnt.', amount: 1, price: 200 },
          { name: 'A1', unit: 'vnt.', amount: 1, price: 200 },
        ],
      };
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      let uniqueBuyerNames = await getUniqueLineItemsNames(db, '');
      expect(uniqueBuyerNames).toHaveLength(3);
      expect(uniqueBuyerNames.map((i) => i.name)).toEqual(['A1', 'G1', 'G2']);

      uniqueBuyerNames = await getUniqueLineItemsNames(db, 'A');
      expect(uniqueBuyerNames).toHaveLength(1);
      expect(uniqueBuyerNames.map((i) => i.name)).toEqual(['A1']);
    });

    it('gets unique line items names returns max value', async () => {
      const invoice: IInvoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer1',
        seller: 'Seller',
        issuer: 'Issuer',
        extra: 'Extra',
        language: 'lt',
        lineItems: [{ name: 'G1', unit: 'vnt.', amount: 1, price: 100 }],
      };
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      invoice.seriesId = 2;
      invoice.lineItems = [{ name: 'G1', unit: 'vnt.', amount: 1, price: 120 }];
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      const uniqueBuyerNames = await getUniqueLineItemsNames(db, '');
      expect(uniqueBuyerNames).toHaveLength(1);
      expect(uniqueBuyerNames[0].name).toEqual('G1');
      expect(uniqueBuyerNames[0].price).toEqual(120);
    });
  });
});
