import { test, expect, vitest } from 'vitest';
import { render, screen, fireEvent } from 'test-utils';
import '@testing-library/jest-dom/vitest';

import { MultiEditModalContent } from './MultiEditModalContent';

test('send not sent invoices', async () => {
  const onChange = vitest.fn();
  render(<MultiEditModalContent onChange={onChange} />);

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
