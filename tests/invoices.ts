import { validateInput, validateTextArea } from './utils';

export async function fillNewInvoice(page, invoice) {
  if (invoice.invoiceType === 'proforma') {
    await page.click('text="Išankstinė"');
  } else if (invoice.invoiceType === 'credit') {
    await page.click('text="Kreditinė"');
  }

  await page.click('input[aria-label="Serijos pavadinimas"]');
  await page.fill(
    'input[aria-label="Serijos pavadinimas"]',
    invoice.seriesName,
  );
  await page.press('input[aria-label="Serijos pavadinimas"]', 'Escape');
  await page.waitForTimeout(500); // give time for debounce to kick in

  if (invoice.seriesId > 0) {
    await page.click('input[aria-label="Serijos numeris"]');
    await page.fill(
      'input[aria-label="Serijos numeris"]',
      invoice.seriesId.toString(),
    );
  }

  await page.click('input[aria-label="Sąskaitos data"]', {
    position: { x: 5, y: 5 },
  });
  await page.type(
    'input[aria-label="Sąskaitos data"]',
    new Date(invoice.created).toISOString().slice(0, 10),
  );

  if (invoice.language !== 'lt') {
    await page.click('div[aria-label="Kalba"]');
    await page.click('li[aria-label="en"]');
  }

  await page.click('textarea[aria-label="Pardavėjas"]');
  await page.fill('textarea[aria-label="Pardavėjas"]', invoice.seller);

  await page.click('textarea[aria-label="Pirkėjas"]');
  await page.fill('textarea[aria-label="Pirkėjas"]', invoice.buyer);
  await page.press('textarea[aria-label="Pirkėjas"]', 'Escape');

  await page.click('input[aria-label="SF išrašė"]');
  await page.fill('input[aria-label="SF išrašė"]', invoice.issuer);

  await page.click('textarea[aria-label="Papildoma informacija"]');
  await page.fill(
    'textarea[aria-label="Papildoma informacija"]',
    invoice.extra,
  );

  for (let i = 0; i < invoice.lineItems.length; i++) {
    if (i > 0) {
      await page.click('text="Pridėti paslaugą ar prekę"');
    }

    const pid = ` ${i + 1}`;
    await page.click(`input[aria-label="Paslaugos pavadinimas${pid}"]`);
    await page.fill(
      `input[aria-label="Paslaugos pavadinimas${pid}"]`,
      invoice.lineItems[i].name,
    );
    await page.press(
      `input[aria-label="Paslaugos pavadinimas${pid}"]`,
      'Escape',
    );

    await page.click(`input[aria-label="Matas${pid}"]`);
    await page.fill(
      `input[aria-label="Matas${pid}"]`,
      invoice.lineItems[i].unit,
    );

    await page.click(`input[aria-label="Kiekis${pid}"]`);
    await page.fill(
      `input[aria-label="Kiekis${pid}"]`,
      invoice.lineItems[i].amount.toString(),
    );

    await page.click(`input[aria-label="Kaina${pid}"]`);
    await page.fill(
      `input[aria-label="Kaina${pid}"]`,
      invoice.lineItems[i].price.toString(),
    );

    if (invoice.lineItems[i].vat) {
      await page.click(`input[aria-label="PVMproc${pid}"]`);
      await page.fill(
        `input[aria-label="PVMproc${pid}"]`,
        invoice.lineItems[i].vat.toString(),
      );
    }
  }

  if (invoice.alreadyPaid > 0) {
    await page.click('input[aria-label="Jau apmokėta"]');
    await page.fill(
      'input[aria-label="Jau apmokėta"]',
      (invoice.alreadyPaid / 100).toString(),
    );
  }
}

export async function validateInvoice(page, invoice) {
  await validateInput(page, 'Serijos numeris', invoice.seriesId.toString());

  await validateInput(
    page,
    'Sąskaitos data',
    new Date(invoice.created).toISOString().slice(0, 10),
    (a) => a.replace(/[^0-9-]*/g, ''),
  );

  await validateTextArea(page, 'Pardavėjas', invoice.seller);

  await validateTextArea(page, 'Pirkėjas', invoice.buyer);

  await validateInput(page, 'SF išrašė', invoice.issuer);

  await validateTextArea(page, 'Papildoma informacija', invoice.extra);

  for (let i = 0; i < invoice.lineItems.length; i++) {
    const pid = ` ${i + 1}`;

    await validateInput(
      page,
      `Paslaugos pavadinimas${pid}`,
      invoice.lineItems[i].name,
    );

    await validateInput(page, `Matas${pid}`, invoice.lineItems[i].unit);

    await validateInput(
      page,
      `Kiekis${pid}`,
      invoice.lineItems[i].amount.toString(),
    );

    await validateInput(
      page,
      `Kaina${pid}`,
      invoice.lineItems[i].price.toString(),
    );

    if (invoice.lineItems[i].vat) {
      await validateInput(
        page,
        `PVMproc${pid}`,
        invoice.lineItems[i].vat.toString(),
      );
    }
  }

  if (invoice.alreadyPaid) {
    await validateInput(
      page,
      'Jau apmokėta',
      (invoice.alreadyPaid / 100).toString(),
    );
  }
}
