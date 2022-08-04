import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
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
      <TextField
        disabled={!enabled}
        label="Siunčiamo laiško tema"
        inputProps={{
          'aria-label': 'Siunčiamo laiško tema',
        }}
        value={emailSubject}
        onChange={(e) => {
          setEmailSubject(e.target.value);
        }}
        fullWidth
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
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
