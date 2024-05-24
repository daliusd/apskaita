import { test, expect, vitest } from 'vitest';
import { render, screen, server, fireEvent } from 'test-utils';
import { http, HttpResponse } from 'msw';
import '@testing-library/jest-dom/vitest';

import { MultiEditModalContent } from './MultiEditModalContent';

test('loads and displays invoice count', async () => {
  render(<MultiEditModalContent />);

  await screen.findByTestId('invoiceCount');

  expect(screen.getByTestId('invoiceCount')).toHaveTextContent(
    'Sąskaitų faktūrų: 2',
  );
  expect(screen.getByTestId('table-row-1')).toHaveTextContent('Jonas');
  expect(screen.getByTestId('invoice-check-1')).toBeVisible();
  expect(screen.getByTestId('invoice-check-1')).toBeChecked();
  expect(screen.getByTestId('table-row-2')).toHaveTextContent('Petras');
  expect(screen.getByTestId('invoice-check-2')).toBeVisible();
  expect(screen.getByTestId('invoice-check-2')).toBeChecked();
});

test('allows to deselect invoice row', async () => {
  render(<MultiEditModalContent />);

  expect(screen.getByTestId('invoice-check-1')).toBeChecked();
  fireEvent.click(screen.getByTestId('invoice-check-1'));
  expect(screen.getByTestId('invoice-check-1')).not.toBeChecked();
  expect(await screen.findByTestId('invoiceCount')).toHaveTextContent(
    'Sąskaitų faktūrų: 2. Pažymėta: 1',
  );
});

test('allows to deselect and select alls rows by clicking header checkbox', async () => {
  render(<MultiEditModalContent />);

  fireEvent.click(screen.getByTestId('invoice-check-all'));
  expect(screen.getByTestId('invoice-check-1')).not.toBeChecked();
  expect(screen.getByTestId('invoice-check-2')).not.toBeChecked();
  expect(await screen.findByTestId('invoiceCount')).toHaveTextContent(
    'Sąskaitų faktūrų: 2. Pažymėta: 0',
  );

  fireEvent.click(screen.getByTestId('invoice-check-all'));
  expect(screen.getByTestId('invoice-check-1')).toBeChecked();
  expect(screen.getByTestId('invoice-check-2')).toBeChecked();
  expect(await screen.findByTestId('invoiceCount')).toHaveTextContent(
    'Sąskaitų faktūrų: 2. Pažymėta: 2',
  );
});

test('mark selected is paid', async () => {
  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  fireEvent.click(screen.getByLabelText('Pažymėti kaip apmokėtas'));

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Sąskaitų pažymėta kaip apmokėtos: 2',
  );
  expect(onChange).toHaveBeenCalledOnce();
});

test('mark selected is paid (not all)', async () => {
  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  fireEvent.click(screen.getByTestId('invoice-check-1'));
  fireEvent.click(screen.getByLabelText('Pažymėti kaip apmokėtas'));

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Sąskaitų pažymėta kaip apmokėtos: 1',
  );
  expect(onChange).toHaveBeenCalledOnce();
});

test('mark selected is paid (with failures)', async () => {
  server.use(
    http.put(
      '/api/invoicespaid/*',
      () => {
        return new HttpResponse(null, { status: 500 });
      },
      { once: true },
    ),
  );

  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  fireEvent.click(screen.getByLabelText('Pažymėti kaip apmokėtas'));

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Sąskaitų pažymėta kaip apmokėtos: 1. Nepavyko pažymėti: 1',
  );
  expect(onChange).toHaveBeenCalledOnce();
});

test('handles server error', async () => {
  server.use(
    http.get('/api/invoices', () => {
      return new HttpResponse(null, { status: 500 });
    }),
  );

  render(<MultiEditModalContent />);

  await screen.findByTestId('error');

  expect(screen.getByTestId('error')).toHaveTextContent(
    'Klaida parsiunčiant sąskaitų faktūrų sąrašą.',
  );
});
