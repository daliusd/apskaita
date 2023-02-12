import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import useSWR from 'swr';

import Link from '../../src/Link';
import { defaultEmailTemplate } from '../../utils/email';

interface Props {
  language: string;
}

export default function EmailTemplateEdit({ language }: Props) {
  const [emailTemplateCurrent, setEmailTemplateCurrent] = useState<
    string | undefined
  >(undefined);
  const [emailTemplate, setEmailTemplate] = useState(
    defaultEmailTemplate[language],
  );
  const [enabled, setEnabled] = useState(false);

  const settingApiUrl = `/api/settings/emailtemplate${
    language === 'lt' ? '' : '_en'
  }`;

  const { data } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data) {
      setEmailTemplate(data.value || defaultEmailTemplate[language]);
      setEmailTemplateCurrent(data.value || defaultEmailTemplate[language]);
    }
    setEnabled(true);
  }, [data, language]);

  return (
    <>
      <TextField
        disabled={!enabled}
        label="Siunčiamo laiško šablonas"
        inputProps={{
          'aria-label': 'Siunčiamo laiško šablonas',
        }}
        helperText={
          <>
            &#123;&#123;išrašė&#125;&#125; siunčiant bus pakeista asmeniu, kuris
            išrašė sąskaitą faktūrą. &#123;&#123;sfnr&#125;&#125; bus pakeista
            sąskaitos faktūros numeriu.{' '}
            <Link href="/straipsniai/saskaitu-fakturu-siuntimas">
              „Sąskaitų faktūrų siuntimas“
            </Link>
            .
          </>
        }
        value={emailTemplate}
        onChange={(e) => {
          setEmailTemplate(e.target.value);
        }}
        fullWidth
        multiline
        rows={8}
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
        disabled={emailTemplate === emailTemplateCurrent}
        onClick={async () => {
          try {
            await fetch(settingApiUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: emailTemplate }),
            });
            setEmailTemplateCurrent(emailTemplate);
          } catch {}
        }}
        aria-label="Išsaugoti siunčiamo laiško šabloną"
      >
        Išsaugoti
      </Button>
    </>
  );
}
