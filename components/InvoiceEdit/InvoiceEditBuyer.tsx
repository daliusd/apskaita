import { useRecoilState } from 'recoil';
import BuyerInput from '../inputs/BuyerInput';

import { buyerState, emailState, lockedState } from '../../src/atoms';

export default function InvoiceEditBuyer() {
  const [buyer, setBuyer] = useRecoilState(buyerState);
  const [email, setEmail] = useRecoilState(emailState);
  const [locked] = useRecoilState(lockedState);

  return (
    <BuyerInput
      buyer={buyer}
      onChange={(buyerInfo) => {
        setBuyer(buyerInfo.buyer);
        if (!email) {
          setEmail(buyerInfo.email);
        }
      }}
      disabled={locked}
    />
  );
}
