import { test, expect, vitest } from 'vitest';
import { render, screen, server, fireEvent } from 'test-utils';
import { http, HttpResponse } from 'msw';
import '@testing-library/jest-dom/vitest';

import { MultiEditModalContent } from './MultiEditModalContent';

test('create new invoiced based on old', async () => {
  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Sukurti naujas sąskaitas senų pagrindu',
    }),
  );

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Sukurta naujų sąskaitų senų pagrindu: 2',
  );
  expect(onChange).toHaveBeenCalledOnce();
});

test('create new invoiced based on old (not all)', async () => {
  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  fireEvent.click(screen.getByTestId('invoice-check-1'));
  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Sukurti naujas sąskaitas senų pagrindu',
    }),
  );

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Sukurta naujų sąskaitų senų pagrindu: 1',
  );
  expect(onChange).toHaveBeenCalledOnce();
});

test('create new invoiced based on old (with failures)', async () => {
  server.use(
    http.post(
      '/api/invoices',
      () => {
        return new HttpResponse(null, { status: 500 });
      },
      { once: true },
    ),
  );

  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Sukurti naujas sąskaitas senų pagrindu',
    }),
  );

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Sukurta naujų sąskaitų senų pagrindu: 1. Nepavyko sukurti: 1',
  );
  expect(onChange).toHaveBeenCalledOnce();
});
