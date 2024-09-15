import { useState } from 'react';
import { Button, Modal } from '@mantine/core';
import { useRecoilState } from 'recoil';

import { lockedState } from '../../src/atoms';
import { CompanySearch } from '../CompanySearch/CompanySearch';

export default function InvoiceEditBuyerSearch() {
  const [locked] = useRecoilState(lockedState);
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        aria-label="Išsaugoti Google Drive"
        onClick={() => setShowSearchModal(true)}
        disabled={locked}
      >
        Ieškoti įmonės
      </Button>
      <Modal
        opened={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Ieškoti įmonės"
        size="lg"
      >
        <CompanySearch onClose={() => setShowSearchModal(false)} />
      </Modal>
    </>
  );
}
