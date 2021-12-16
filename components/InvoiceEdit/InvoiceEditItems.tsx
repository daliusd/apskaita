import React from 'react';
import { useRecoilState } from 'recoil';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';

import LineItemEdit from './LineItemEdit';

import { lineItemsState, lockedState } from '../../src/atoms';

export default function InvoiceEditItems() {
  const [lineItems, setLineItems] = useRecoilState(lineItemsState);
  const [locked] = useRecoilState(lockedState);

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6">Paslaugos ar prekės</Typography>
      </Grid>

      {lineItems.map((g, idx) => {
        return (
          <LineItemEdit
            key={g.id}
            idx={idx}
            lineItem={g}
            deleteEnabled={lineItems.length > 1}
            onDelete={() => {
              setLineItems(lineItems.filter((gt) => gt.id != g.id));
            }}
            onChange={(gn) => {
              setLineItems(
                lineItems.map((g) => {
                  if (gn.id != g.id) {
                    return g;
                  }
                  return gn;
                }),
              );
            }}
            disabled={locked}
          />
        );
      })}

      <Grid item xs={12}>
        <Button
          color="primary"
          startIcon={<AddIcon />}
          aria-label="Pridėti paslaugą ar prekę"
          disabled={locked}
          onClick={() => {
            setLineItems([
              ...lineItems,
              {
                id: Math.max(...lineItems.map((g) => g.id)) + 1,
                name: '',
                unit: 'vnt.',
                amount: 1,
                price: 0,
              },
            ]);
          }}
        >
          Pridėti paslaugą ar prekę
        </Button>
      </Grid>
    </>
  );
}
