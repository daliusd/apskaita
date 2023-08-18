import { useSession } from 'next-auth/react';
import TextField from '@mui/material/TextField';
import { useRecoilState } from 'recoil';

import { emailState, lockedState } from '../../src/atoms';

export default function BuyerEmailInput() {
  const { data: session } = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;

  const [email, setEmail] = useRecoilState(emailState);
  const [locked] = useRecoilState(lockedState);

  const looksLikeEmail = email.indexOf('@') !== -1;
  const error = email.length > 0 && !looksLikeEmail;

  return (
    <TextField
      variant="standard"
      inputProps={{ 'aria-label': 'Pirkėjo el. pašto adresas' }}
      label="Pirkėjo el. pašto adresas"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
      }}
      disabled={locked}
      error={error}
      helperText={
        error
          ? 'čia turi būti įvestas el. pašto adresas'
          : !gmailSend
          ? 'Jei norite siųsti el. laiškus tiesiai iš haiku.lt duokite leidimą. Tai galite padaryti atsijungę ir vėl prisijungę prie haiku.lt'
          : 'Galite nurodyti kelis el. pašto adresus. Tokiu atveju atskirkite juos kableliu.'
      }
      fullWidth
    />
  );
}
