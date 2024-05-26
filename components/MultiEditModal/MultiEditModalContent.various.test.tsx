import { test, expect, vitest } from 'vitest';
import { render, screen, fireEvent, waitFor } from 'test-utils';
import '@testing-library/jest-dom/vitest';

import { MultiEditModalContent } from './MultiEditModalContent';

test('send not sent invoices', async () => {
  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  await waitFor(
    () =>
      expect(
        screen.getByRole('button', { name: 'Išsiųsti neišsiųstas' }),
      ).not.toBeDisabled(),
    {
      timeout: 5000,
    },
  );

  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Išsiųsti neišsiųstas',
    }),
  );

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Išsiųsta sąskaitų: 1',
  );
  expect(onChange).toHaveBeenCalledOnce();
});

test('save to gdrive not saved invoices', async () => {
  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  await waitFor(
    () =>
      expect(
        screen.getByRole('button', { name: 'Išsaugoti į Google Drive' }),
      ).not.toBeDisabled(),
    {
      timeout: 5000,
    },
  );

  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Išsaugoti į Google Drive',
    }),
  );

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Sąskaitų išsaugotą į Google Drive: 2',
  );
  expect(onChange).toHaveBeenCalledOnce();
});

test('change line items count in invoice', async () => {
  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Pakeisti prekių/paslaugų skaičių į',
    }),
  );

  expect(await screen.findByTestId('operation-result')).toHaveTextContent(
    'Pakeista sąskaitų: 2',
  );
  expect(onChange).toHaveBeenCalledOnce();
});
