import { useCallback, useEffect, useState } from 'react';
import { RecoilState, useRecoilState } from 'recoil';
import useSWR from 'swr';
import { notifications } from '@mantine/notifications';
import { Button, Textarea } from '@mantine/core';

import { cleanUpString } from '../../utils/textutils';
import {
  buyerState,
  emailState,
  extraState,
  invoiceDateState,
  invoiceTypeState,
  issuerState,
  languageAfterChangeState,
  languageState,
  lineItemsState,
  lockedState,
  sellerState,
  seriesIdState,
  seriesNameState,
} from '../../src/atoms';
import { useDebounce } from 'react-use';
import { usePlan } from '../../src/usePlan';
import { runExtraInputProgram } from '../utils/runExtraInputProgram';

function useDebouncedRecoilState<T>(recoilState: RecoilState<T>) {
  const [value] = useRecoilState(recoilState);
  const [debouncedValue, setDebouncedValue] = useState<T>();
  useDebounce(() => setDebouncedValue(value), 500, [value]);
  return debouncedValue;
}

export default function ExtraInput() {
  const { isFree } = usePlan();
  const [extra, setExtra] = useRecoilState(extraState);
  const [locked] = useRecoilState(lockedState);
  const [languageAfterChange] = useRecoilState(languageAfterChangeState);

  const invoiceType = useDebouncedRecoilState(invoiceTypeState);
  const seriesName = useDebouncedRecoilState(seriesNameState);
  const seriesId = useDebouncedRecoilState(seriesIdState);
  const invoiceDate = useDebouncedRecoilState(invoiceDateState);
  const language = useDebouncedRecoilState(languageState);
  const seller = useDebouncedRecoilState(sellerState);
  const buyer = useDebouncedRecoilState(buyerState);
  const email = useDebouncedRecoilState(emailState);
  const issuer = useDebouncedRecoilState(issuerState);
  const lineItems = useDebouncedRecoilState(lineItemsState);

  const { data: extraInputProgramData } = useSWR(
    '/api/settings/extrainputprogram',
  );
  const extraInputProgram = extraInputProgramData?.value as string;
  const { data: lastSellerData } = useSWR(
    languageAfterChange &&
      seriesName &&
      `/api/lastseller/${languageAfterChange}/${seriesName}`,
  );
  useEffect(() => {
    if (lastSellerData && lastSellerData.extra) {
      setExtra(lastSellerData.extra);
    }
  }, [lastSellerData, setExtra]);

  const disabled = locked || (languageAfterChange && !lastSellerData);

  const runProgram = useCallback(async () => {
    try {
      if (isFree || !extraInputProgram || disabled) {
        return;
      }

      const result = await runExtraInputProgram({
        lineItems,
        invoiceType,
        seriesName,
        seriesId,
        invoiceDate,
        language,
        seller,
        buyer,
        email,
        issuer,
        extraInputProgram,
      });
      setExtra(result as string);
    } catch (e) {
      notifications.show({
        message: `Klaida vykdant programą: ${e.message} ${e.stack}`,
        color: 'red',
      });
    }
  }, [
    buyer,
    disabled,
    email,
    extraInputProgram,
    invoiceDate,
    invoiceType,
    isFree,
    issuer,
    language,
    lineItems,
    seller,
    seriesId,
    seriesName,
    setExtra,
  ]);

  useEffect(() => {
    if (extraInputProgram?.startsWith('// AUTO')) {
      runProgram();
    }
  }, [extraInputProgram, runProgram]);

  return (
    <>
      <Textarea
        label="Papildoma informacija sąskaitoje faktūroje"
        aria-label={'Papildoma informacija'}
        value={extra}
        onChange={(e) => {
          setExtra(cleanUpString(e.target.value));
        }}
        autosize
        minRows={2}
        disabled={disabled}
      />
      {!isFree &&
        extraInputProgram &&
        !extraInputProgram.startsWith('// AUTO') && (
          <Button variant="subtle" onClick={runProgram}>
            Vykdyti papildomos informacijos programą
          </Button>
        )}
    </>
  );
}
