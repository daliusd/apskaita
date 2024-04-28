import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';

import { emailState, lockedState } from '../../src/atoms';
import { TextInput } from '@mantine/core';

export default function BuyerEmailInput() {
  const { data: session } = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;

  const [email, setEmail] = useRecoilState(emailState);
  const [locked] = useRecoilState(lockedState);

  const looksLikeEmail = email.indexOf('@') !== -1;
  const error = email.length > 0 && !looksLikeEmail;

  let errorDomainWithoutDot = false;
  if (looksLikeEmail) {
    const domain = email.split('@')[1];
    errorDomainWithoutDot = domain.indexOf('.') === -1 || domain.endsWith('.');
  }

  return (
    <TextInput
      aria-label={'Pirkėjo el. pašto adresas'}
      label="Pirkėjo el. pašto adresas"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
      }}
      disabled={locked}
      description={
        !gmailSend
          ? 'Jei norite siųsti el. laiškus tiesiai iš haiku.lt duokite leidimą. Tai galite padaryti atsijungę ir vėl prisijungę prie haiku.lt'
          : 'Galite nurodyti kelis el. pašto adresus. Tokiu atveju atskirkite juos kableliu.'
      }
      error={
        errorDomainWithoutDot
          ? 'Patikrinkite el. pašto adresą'
          : error
            ? 'čia turi būti įvestas el. pašto adresas'
            : undefined
      }
    />
  );
}
