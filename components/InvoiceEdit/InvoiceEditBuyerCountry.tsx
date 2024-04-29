import { useRecoilState } from 'recoil';
import { Text } from '@mantine/core';
import countries from 'i18n-iso-countries';

import { buyerState, languageState } from '../../src/atoms';
import { useMemo } from 'react';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/lt.json'));

export default function InvoiceEditBuyerCountry() {
  const [buyer] = useRecoilState(buyerState);
  const [language] = useRecoilState(languageState);

  const country = useMemo(() => {
    const country = buyer.split('\n').at(-1);
    if (countries.isValid(country)) {
      return countries.getName(country, 'lt');
    }

    const code = countries.getAlpha2Code(country, language);
    if (code) {
      return countries.getName(code, 'lt');
    }

    return undefined;
  }, [buyer, language]);

  return (
    <Text size="xs" c="dimmed">
      {country
        ? `Sistame nustatė, kad pirkėjo šalis yra ${country}. Ši informacija gali būti naudojama generuojant i.SAF XML failą.`
        : 'Jei norite nurodyti pirkėjo šalį, tai darykite paskutinėje pirkėjo aprašo eilutėje. Jei šalis nenurodyta, sistema darys prielaidą, kad pirkėjo šalis yra Lietuva.'}
    </Text>
  );
}
