import { useRecoilState } from 'recoil';
import { Select } from '@mantine/core';

import {
  languageState,
  languageAfterChangeState,
  lockedState,
} from '../../src/atoms';

export default function LanguageSelect() {
  const [language, setLanguage] = useRecoilState(languageState);
  const [, setLanguageAfterChange] = useRecoilState(languageAfterChangeState);
  const [locked] = useRecoilState(lockedState);

  return (
    <Select
      label="Kalba"
      data={['Lietuvių', 'Anglų']}
      value={language === 'lt' ? 'Lietuvių' : 'Anglų'}
      onChange={(value) => {
        const lng = value === 'Lietuvių' ? 'lt' : 'en';
        setLanguage(lng);
        setLanguageAfterChange(lng);
      }}
      disabled={locked}
    />
  );
}
