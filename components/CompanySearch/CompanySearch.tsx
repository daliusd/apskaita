import { useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Button, Loader, Stack, Table, Text, TextInput } from '@mantine/core';
import useDebounce from 'react-use/lib/useDebounce';
import useSWR from 'swr';

import { buyerState } from '../../src/atoms';

interface Props {
  onClose: () => void;
}

export function CompanySearch({ onClose }: Props) {
  const [, setBuyer] = useRecoilState(buyerState);
  const [name, setName] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  useDebounce(() => setDebouncedName(name.toLocaleLowerCase()), 500, [name]);

  const query =
    debouncedName && debouncedName.length > 1
      ? `https://raw.githubusercontent.com/daliusd/imones/main/data/${debouncedName.split(' ')[0].slice(0, 4)}.json`
      : null;
  const { data, error, isLoading } = useSWR(query);

  const tenRelevant = useMemo(() => {
    if (!data) {
      return [];
    }
    const result = [];
    for (const c of data) {
      if (c.name.toLocaleLowerCase().indexOf(debouncedName) !== -1) {
        result.push(c);
      }

      if (result.length === 20) break;
    }
    return result;
  }, [data, debouncedName]);

  return (
    <Stack>
      <TextInput
        aria-label={'Įmonės pavadinimas'}
        label="Įmonės pavadinimas"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        description={'Ieškoma pagal Registrų Centro ir VMI duomenis.'}
      />

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Įmonės pavadinimas</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isLoading && <Loader />}
          {error && <Text data-testid="error">Klaida ieškant įmonės.</Text>}
          {!isLoading && !error && tenRelevant.length === 0 && (
            <Text data-testid="info">
              Įveskite bent dvi įmonės pavadinimo raides.
            </Text>
          )}
          {!isLoading &&
            !error &&
            tenRelevant.map((c) => (
              <Table.Tr key={c.code}>
                <Table.Td>{c.name}</Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    onClick={() => {
                      let buyer = `${c.name}\nĮmonės kodas: ${c.code}\n`;
                      if (c.vatcode) {
                        buyer += `PVM kodas: ${c.vatcode}\n`;
                      }
                      if (c.address) {
                        buyer += c.address;
                      }
                      setBuyer(buyer);
                      onClose();
                    }}
                  >
                    Naudoti
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
