import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import EditIcon from '@material-ui/icons/Edit';
import useSWR from 'swr';

interface Props {
  language: string;
}

const defaultEmailTemplate = {
  lt: `Sveiki,

Siunčiame jums sąskaitą faktūrą.

Su pagarba,
{{issuer}}`,
  en: `Hello,

We are sending an invoice for you.

Best regards,
{{issuer}}`,
};

export default function EmailTemplateEdit({ language }: Props) {
  const [emailTemplateCurrent, setEmailTemplateCurrent] = useState<
    string | undefined
  >(undefined);
  const [emailTemplate, setEmailTemplate] = useState(
    defaultEmailTemplate[language],
  );

  const settingApiUrl = `/api/settings/emailtemplate${
    language === 'lt' ? '' : '_en'
  }`;

  const { data, error } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data) {
      setEmailTemplate(data.value || defaultEmailTemplate[language]);
      setEmailTemplateCurrent(data.value || defaultEmailTemplate[language]);
    }
  }, [data, language]);

  if (!data && !error) return <LinearProgress />;

  return (
    <>
      <TextField
        label="Siunčiamo laiško šablonas"
        inputProps={{
          'aria-label': 'Siunčiamo laiško šablonas',
        }}
        helperText="{{issuer}} siunčiant bus pakeista asmeniu, kuris išrašė sąskaitą faktūrą."
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
          await fetch(settingApiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: emailTemplate }),
          });
          setEmailTemplateCurrent(emailTemplate);
        }}
        aria-label="Išsaugoti siunčiamo laiško šabloną"
      >
        Išsaugoti
      </Button>
    </>
  );
}
