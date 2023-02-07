import { mkdtempSync, existsSync, rmdirSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { Database } from 'sqlite';
import {
  openDb,
  setSetting,
  getSetting,
  createInvoice,
  getInvoiceList,
  getInvoiceWithLineItems,
  getNextSeriesId,
  validSeriesNumber,
  validCreatedDate,
  updateInvoice,
  IInvoice,
  deleteInvoice,
  getUniqueSeriesNames,
  getUniqueBuyers,
  getUniqueLineItemsNames,
  changeInvoicePaidStatus,
  changeInvoiceLockedStatus,
  changeInvoiceSentStatus,
} from './db';

describe('database tests', () => {
  it('opens and migrates DB', async () => {
    const db = await openDb(':memory:');
    await db.close();
  });

  describe('test in file system', () => {
    const OLD_ENV = process.env;
    let tempDir = '';

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      tempDir = mkdtempSync(path.join(tmpdir(), 'db'));
    });

    afterEach(() => {
      process.env = OLD_ENV;
      rmdirSync(tempDir, { recursive: true });
    });

    it('opens and migrates DB in file system', async () => {
      process.env.USER_DATA_PATH = tempDir;

      const db = await openDb('test');
      await db.close();

      expect(existsSync(path.join(tempDir, 'db', 'test.db'))).toBeTruthy();
    });
  });

  describe('handles settings properly', () => {
    let db: Database;

    beforeEach(async () => {
      db = await openDb(':memory:');
    });

    afterEach(async () => {
      await db.close();
    });

    it('sets and gets setting', async () => {
      await setSetting(db, 'name', 'test');
      const name = await getSetting(db, 'name');
      expect(name).toEqual('test');
    });

    it('overwrites setting', async () => {
      await setSetting(db, 'name', 'test');
      await setSetting(db, 'name', 'test2');
      const name = await getSetting(db, 'name');
      expect(name).toEqual('test2');
    });

    it('if setting is not set', async () => {
      const name = await getSetting(db, 'name');
      expect(name).toBeUndefined();
    });
  });

  describe('handles invoices properly', () => {
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
        seriesName: '@',
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
      let invoices = await getInvoiceList(db, { invoiceType: 'proforma' });
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoiceId);
      expect(invoices[0].seriesName).toEqual(invoice.seriesName);
      expect(invoices[0].seriesId).toEqual(invoice.seriesId);
      expect(invoices[0].created).toEqual(invoice.created);
      expect(invoices[0].price).toEqual(invoice.price);
      expect(invoices[0].buyer).toEqual(invoice.buyer);

      invoices = await getInvoiceList(db, { invoiceType: 'simple' });
      expect(invoices).toHaveLength(0);

      invoices = await getInvoiceList(db, {});
      expect(invoices).toHaveLength(1);
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
          { name: 'test', unit: 'vnt.', amount: 1, price: 100 },
          { name: 'test2', unit: 'vnt.', amount: 2, price: 200 },
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

      expect(retInvoice.lineItems[1].name).toEqual('test2');
      expect(retInvoice.lineItems[1].unit).toEqual('vnt.');
      expect(retInvoice.lineItems[1].amount).toEqual(2);
      expect(retInvoice.lineItems[1].price).toEqual(200);
    });

    it('returns undefined if there is no invoice', async () => {
      const retInvoice = await getInvoiceWithLineItems(db, -1);
      expect(retInvoice).toBeUndefined();
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
        { name: 'test3', unit: 'vnt.', amount: 1, price: 20 },
        { name: 'test4', unit: 'vnt.', amount: 3, price: 60 },
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

      expect(retInvoice.lineItems[1].name).toEqual('test4');
      expect(retInvoice.lineItems[1].unit).toEqual('vnt.');
      expect(retInvoice.lineItems[1].amount).toEqual(3);
      expect(retInvoice.lineItems[1].price).toEqual(60);
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

    it('does not return special names with unique series names', async () => {
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
      invoice.seriesName = '@';
      await createInvoice(db, invoice);

      let uniqueSerieNames = await getUniqueSeriesNames(db, '');
      expect(uniqueSerieNames).toHaveLength(1);
      expect(uniqueSerieNames).toEqual(['DD']);
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
