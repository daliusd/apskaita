import { Database } from 'sqlite';
import {
  openDb,
  setSetting,
  getSetting,
  createInvoice,
  getInvoiceList,
  getInvoiceWithGoods,
  getNextSeriesId,
  validSerieNumber,
  validCreatedDate,
  updateInvoice,
  Invoice,
  deleteInvoice,
  getUniqueSeriesNames,
  getUniqueBuyerNames,
  getUniqueGoodNames,
} from './db';

describe('database tests', () => {
  it('opens and migrates DB', async () => {
    const db = await openDb(':memory:');
    await db.close();
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
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        goods: [],
      };
      const { invoiceId } = await createInvoice(db, invoice);
      const invoices = await getInvoiceList(db, 10, 0);
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoiceId);
      expect(invoices[0].seriesName).toEqual(invoice.seriesName);
      expect(invoices[0].seriesId).toEqual(invoice.seriesId);
      expect(invoices[0].created).toEqual(invoice.created);
      expect(invoices[0].price).toEqual(invoice.price);
      expect(invoices[0].buyer).toEqual(invoice.buyer);
    });

    it('returns invoices on the same date sorted by series number', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        goods: [],
      };
      await createInvoice(db, invoice);

      invoice.seriesId = 3;
      await createInvoice(db, invoice);

      invoice.seriesId = 2;
      await createInvoice(db, invoice);

      const invoices = await getInvoiceList(db, 10, 0);
      expect(invoices).toHaveLength(3);
      expect(invoices[0].seriesId).toEqual(3);
      expect(invoices[1].seriesId).toEqual(2);
      expect(invoices[2].seriesId).toEqual(1);
    });

    it('creates invoice with goods', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [
          { name: 'test', amount: 1, price: 100 },
          { name: 'test2', amount: 2, price: 200 },
        ],
      };
      const { invoiceId } = await createInvoice(db, invoice);
      const retInvoice = await getInvoiceWithGoods(db, invoiceId);
      expect(retInvoice.id).toEqual(invoiceId);
      expect(retInvoice.seriesName).toEqual(invoice.seriesName);
      expect(retInvoice.seriesId).toEqual(invoice.seriesId);
      expect(retInvoice.created).toEqual(invoice.created);
      expect(retInvoice.price).toEqual(invoice.price);
      expect(retInvoice.buyer).toEqual(invoice.buyer);

      expect(retInvoice.goods[0].name).toEqual('test');
      expect(retInvoice.goods[0].amount).toEqual(1);
      expect(retInvoice.goods[0].price).toEqual(100);

      expect(retInvoice.goods[1].name).toEqual('test2');
      expect(retInvoice.goods[1].amount).toEqual(2);
      expect(retInvoice.goods[1].price).toEqual(200);
    });

    it('Does not allow to create duplicate Invoice', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 2,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        goods: [],
      };
      let resp = await createInvoice(db, invoice);
      expect(resp.success).toBeTruthy();

      resp = await createInvoice(db, invoice);
      expect(resp.success).toBeFalsy();
    });

    it('Does not allow to create Invoice with invalid created date', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 2,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        goods: [],
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
      const invoice: Invoice = {
        seriesName: 'ZZ',
        seriesId: 123,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [],
      };

      await createInvoice(db, invoice);
      const seriesId = await getNextSeriesId(db, 'ZZ');
      expect(seriesId).toEqual(124);
    });

    it('Validates serie number', async () => {
      expect(await validSerieNumber(db, 'VSN', 1)).toBeTruthy();
    });

    it('Validates serie number for matching serieno', async () => {
      const invoice: Invoice = {
        seriesName: 'VSN',
        seriesId: 123,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [],
      };

      await createInvoice(db, invoice);

      expect(await validSerieNumber(db, 'VSN', 123)).toBeFalsy();
    });

    it('Validates serie number excluding specific invoice', async () => {
      const invoice: Invoice = {
        seriesName: 'VSN',
        seriesId: 123,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [],
      };

      const { invoiceId } = await createInvoice(db, invoice);

      expect(await validSerieNumber(db, 'VSN', 123, invoiceId)).toBeTruthy();
    });

    it('Validates created data', async () => {
      const created = new Date(2020, 0, 31).getTime();
      const invoice: Invoice = {
        seriesName: 'VCD',
        seriesId: 123,
        created,
        price: 500,
        buyer: 'Buyer',
        goods: [],
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
      const invoice: Invoice = {
        seriesName: 'VCD',
        seriesId: 123,
        created,
        price: 500,
        buyer: 'Buyer',
        goods: [],
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
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [
          { name: 'test', amount: 1, price: 100 },
          { name: 'test2', amount: 2, price: 200 },
        ],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.seriesName = 'DE';
      invoice.seriesId = 2;
      invoice.created = new Date(2020, 1, 31).getTime();
      invoice.price = 200;
      invoice.buyer = 'Buyer2';
      invoice.goods = [
        { name: 'test3', amount: 1, price: 20 },
        { name: 'test4', amount: 3, price: 60 },
      ];

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeTruthy();

      const invoices = await getInvoiceList(db, 10, 0);
      expect(invoices).toHaveLength(1);
      const retInvoice = await getInvoiceWithGoods(db, invoiceId);

      expect(retInvoice.id).toEqual(invoiceId);
      expect(retInvoice.seriesName).toEqual(invoice.seriesName);
      expect(retInvoice.seriesId).toEqual(invoice.seriesId);
      expect(retInvoice.created).toEqual(invoice.created);
      expect(retInvoice.price).toEqual(invoice.price);
      expect(retInvoice.buyer).toEqual(invoice.buyer);

      expect(retInvoice.goods.length).toEqual(2);

      expect(retInvoice.goods[0].name).toEqual('test3');
      expect(retInvoice.goods[0].amount).toEqual(1);
      expect(retInvoice.goods[0].price).toEqual(20);

      expect(retInvoice.goods[1].name).toEqual('test4');
      expect(retInvoice.goods[1].amount).toEqual(3);
      expect(retInvoice.goods[1].price).toEqual(60);
    });

    it('does not update invoice if there is invoice with same serie number', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [
          { name: 'test', amount: 1, price: 100 },
          { name: 'test2', amount: 2, price: 200 },
        ],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.seriesId = 2;
      await createInvoice(db, invoice);

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeFalsy();
    });

    it('updates invoice when serie is not changed', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [
          { name: 'test', amount: 1, price: 100 },
          { name: 'test2', amount: 2, price: 200 },
        ],
      };
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.buyer = 'Buyer3';

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeTruthy();
    });

    it('does not update invoice if invoice date is wrong', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [],
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
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [],
      };
      await createInvoice(db, invoice);

      invoice.seriesId = 3;
      const { invoiceId } = await createInvoice(db, invoice);

      invoice.seriesId = 2;
      invoice.created = new Date(2020, 1, 1).getTime();

      const success = await updateInvoice(db, invoiceId, invoice);
      expect(success).toBeTruthy();
    });

    it('deletes invoice', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        goods: [],
      };
      const { invoiceId } = await createInvoice(db, invoice);
      await deleteInvoice(db, invoiceId);
      const invoices = await getInvoiceList(db, 10, 0);
      expect(invoices).toHaveLength(0);
    });

    it('gets unique serie names', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        goods: [],
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

    it('gets unique buyer names', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer1',
        goods: [],
      };
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      invoice.seriesId = 2;
      invoice.buyer = 'Buyer2';
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      invoice.seriesId = 3;
      invoice.buyer = 'ACME';
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      let uniqueBuyerNames = await getUniqueBuyerNames(db, '');
      expect(uniqueBuyerNames).toHaveLength(3);
      expect(uniqueBuyerNames).toEqual(['ACME', 'Buyer1', 'Buyer2']);

      uniqueBuyerNames = await getUniqueBuyerNames(db, 'A');
      expect(uniqueBuyerNames).toHaveLength(1);
      expect(uniqueBuyerNames).toEqual(['ACME']);
    });

    it('gets unique good names', async () => {
      const invoice: Invoice = {
        seriesName: 'DD',
        seriesId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer1',
        goods: [
          { name: 'G1', amount: 1, price: 100 },
          { name: 'G2', amount: 1, price: 200 },
          { name: 'A1', amount: 1, price: 200 },
        ],
      };
      expect((await createInvoice(db, invoice)).success).toBeTruthy();

      let uniqueBuyerNames = await getUniqueGoodNames(db, '');
      expect(uniqueBuyerNames).toHaveLength(3);
      expect(uniqueBuyerNames).toEqual(['A1', 'G1', 'G2']);

      uniqueBuyerNames = await getUniqueGoodNames(db, 'A');
      expect(uniqueBuyerNames).toHaveLength(1);
      expect(uniqueBuyerNames).toEqual(['A1']);
    });
  });
});
