import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import EditIcon from '@material-ui/icons/Edit';
import useSWR from 'swr';

interface Props {
  language: string;
}

const defaultEmailSubject = {
  lt: 'Sąskaita faktūra',
  en: 'Invoice',
};

export default function EmailSubjectEdit({ language }: Props) {
  const [emailSubjectCurrent, setEmailSubjectCurrent] = useState<
    string | undefined
  >(undefined);
  const [emailSubject, setEmailSubject] = useState(
    defaultEmailSubject[language],
  );

  const settingApiUrl = `/api/settings/emailsubject${
    language === 'lt' ? '' : '_en'
  }`;

  const { data, error } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data) {
      setEmailSubject(data.value || defaultEmailSubject[language]);
      setEmailSubjectCurrent(data.value || defaultEmailSubject[language]);
    }
  }, [data, language]);

  if (!data && !error) return <LinearProgress />;

  return (
    <>
      <TextField
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
          await fetch(settingApiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: emailSubject }),
          });
          setEmailSubjectCurrent(emailSubject);
        }}
        aria-label="Išsaugoti siunčiamo laiško temą"
      >
        Išsaugoti
      </Button>
    </>
  );
}
