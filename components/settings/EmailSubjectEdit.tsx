import { useState, useEffect } from 'react';
import { Button, TextInput } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import useSWR from 'swr';

import { defaultEmailSubject } from '../../utils/email';

interface Props {
  language: string;
}

export default function EmailSubjectEdit({ language }: Props) {
  const [emailSubjectCurrent, setEmailSubjectCurrent] = useState<
    string | undefined
  >(undefined);
  const [emailSubject, setEmailSubject] = useState(
    defaultEmailSubject[language],
  );
  const [enabled, setEnabled] = useState(false);

  const settingApiUrl = `/api/settings/emailsubject${
    language === 'lt' ? '' : '_en'
  }`;

  const { data } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data) {
      setEmailSubject(data.value || defaultEmailSubject[language]);
      setEmailSubjectCurrent(data.value || defaultEmailSubject[language]);
    }
    setEnabled(true);
  }, [data, language]);

  return (
    <>
      <TextInput
        disabled={!enabled}
        label="Siunčiamo laiško tema"
        aria-label={'Siunčiamo laiško tema'}
        value={emailSubject}
        onChange={(value) => {
          setEmailSubject(value);
        }}
      />

      <Button
        leftSection={<IconEdit />}
        variant="subtle"
        disabled={emailSubject === emailSubjectCurrent}
        onClick={async () => {
          try {
            await fetch(settingApiUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: emailSubject }),
            });
            setEmailSubjectCurrent(emailSubject);
          } catch {}
        }}
        aria-label="Išsaugoti siunčiamo laiško temą"
      >
        Išsaugoti
      </Button>
    </>
  );
}
