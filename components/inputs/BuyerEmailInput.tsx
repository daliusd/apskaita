import TextField from '@mui/material/TextField';
import { useRecoilState } from 'recoil';

import { emailState, lockedState } from '../../src/atoms';

export default function BuyerEmailInput() {
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
      helperText={error ? 'čia turi būti įvestas el. pašto adresas' : ''}
      fullWidth
    />
  );
}
