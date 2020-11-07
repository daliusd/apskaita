import { Database } from 'sqlite';
import {
  openDb,
  setSetting,
  getSetting,
  createInvoice,
  getInvoiceList,
  getInvoiceWithGoods,
  getNextSerieId,
  validSerieNumber,
  validCreatedDate,
  updateInvoice,
  Invoice,
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
        serieName: 'DD',
        serieId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        goods: [],
      };
      const invoiceId = await createInvoice(db, invoice);
      const invoices = await getInvoiceList(db, 10, 0);
      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toEqual(invoiceId);
      expect(invoices[0].serieName).toEqual(invoice.serieName);
      expect(invoices[0].serieId).toEqual(invoice.serieId);
      expect(invoices[0].created).toEqual(invoice.created);
      expect(invoices[0].price).toEqual(invoice.price);
      expect(invoices[0].buyer).toEqual(invoice.buyer);
    });

    it('creates invoice with goods', async () => {
      const invoice: Invoice = {
        serieName: 'DD',
        serieId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [
          { name: 'test', amount: 1, price: 100 },
          { name: 'test2', amount: 2, price: 200 },
        ],
      };
      const invoiceId = await createInvoice(db, invoice);
      const retInvoice = await getInvoiceWithGoods(db, invoiceId);
      expect(retInvoice.id).toEqual(invoiceId);
      expect(retInvoice.serieName).toEqual(invoice.serieName);
      expect(retInvoice.serieId).toEqual(invoice.serieId);
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
      expect.assertions(1);
      const invoice: Invoice = {
        serieName: 'DD',
        serieId: 2,
        created: new Date(2020, 0, 31).getTime(),
        price: 100,
        buyer: 'Buyer',
        goods: [],
      };
      await createInvoice(db, invoice);
      try {
        await createInvoice(db, invoice);
      } catch (e) {
        expect(e.code).toEqual('SQLITE_CONSTRAINT');
      }
    });

    it('Return next serieId = 1 for non existing serie', async () => {
      const serieId = await getNextSerieId(db, 'AB');
      expect(serieId).toEqual(1);
    });

    it('Return correct next serieId for existing serie', async () => {
      const invoice: Invoice = {
        serieName: 'ZZ',
        serieId: 123,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [],
      };

      await createInvoice(db, invoice);
      const serieId = await getNextSerieId(db, 'ZZ');
      expect(serieId).toEqual(124);
    });

    it('Validates serie number', async () => {
      expect(await validSerieNumber(db, 'VSN', 1)).toBeTruthy();
    });

    it('Validates serie number for matching serieno', async () => {
      const invoice: Invoice = {
        serieName: 'VSN',
        serieId: 123,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [],
      };

      await createInvoice(db, invoice);

      expect(await validSerieNumber(db, 'VSN', 123)).toBeFalsy();
    });

    it('Validates created data', async () => {
      const created = new Date(2020, 0, 31).getTime();
      const invoice: Invoice = {
        serieName: 'VCD',
        serieId: 123,
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

    it('updates invoice', async () => {
      const invoice: Invoice = {
        serieName: 'DD',
        serieId: 1,
        created: new Date(2020, 0, 31).getTime(),
        price: 500,
        buyer: 'Buyer',
        goods: [
          { name: 'test', amount: 1, price: 100 },
          { name: 'test2', amount: 2, price: 200 },
        ],
      };
      const invoiceId = await createInvoice(db, invoice);

      invoice.serieName = 'DE';
      invoice.serieId = 2;
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
      expect(retInvoice.serieName).toEqual(invoice.serieName);
      expect(retInvoice.serieId).toEqual(invoice.serieId);
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
  });
});
