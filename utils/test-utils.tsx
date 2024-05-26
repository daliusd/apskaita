import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { SWRConfig } from 'swr';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/invoices', () => {
    return HttpResponse.json({
      invoices: [
        {
          id: 1,
          seriesName: 'DD',
          seriesId: 1,
          created: 1715558400000,
          price: 1000,
          buyer: 'Jonas',
          email: 'jonas@makaronas.com',
          pdfname: '59142f77-aa78-4c0a-81a9-e969ba772b39.pdf',
          paid: 0,
          locked: 0,
          sent: 0,
          flags: 0,
          vat: 0,
          invoiceType: 'standard',
        },
        {
          id: 2,
          seriesName: 'DD',
          seriesId: 2,
          created: 1715558400000,
          price: 1200,
          buyer: 'Petras',
          pdfname: '46692c2e-9139-4b10-a812-e7740ec96f03.pdf',
          paid: 0,
          locked: 0,
          sent: 0,
          flags: 0,
          vat: 0,
          invoiceType: 'standard',
        },
      ],
    });
  }),
  http.get('/api/initial', () => {
    return HttpResponse.json({
      invoice: {
        id: 3,
        seriesName: 'DD',
        seriesId: 1,
        created: 1715558400000,
        price: 1000,
        buyer: 'Jonas',
        pdfname: '59142f77-aa78-4c0a-81a9-e969ba772b39.pdf',
        paid: 0,
        locked: 0,
        sent: 0,
        flags: 0,
        vat: 0,
        invoiceType: 'standard',
      },
    });
  }),
  http.post('/api/invoices', () => {
    return HttpResponse.json({
      success: true,
      invoiceId: 4,
    });
  }),
  http.post('/api/invoicemailer', () => {
    return HttpResponse.json({
      success: true,
    });
  }),
  http.post('/api/invoicegdrive', () => {
    return HttpResponse.json({
      success: true,
      gdriveId: 'gdriveId',
    });
  }),
  http.put('/api/invoicespdf/*', () => {
    return HttpResponse.json({ success: true });
  }),
  http.put('/api/invoicespaid/*', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: (...url: string[]) =>
          fetch(url.join('')).then((res) => res.json()),
        dedupingInterval: 0,
      }}
    >
      <MantineProvider>{children}</MantineProvider>
    </SWRConfig>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render, server };
