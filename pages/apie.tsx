import React from 'react';
import Grid from '@material-ui/core/Grid';

export default function Apie() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        Haiku.lt - paprasta individualios veiklos apskaitos programa. Aš ją
        sukūriau, kad palengvinčiau gyvenimą mano žmonai, bet tikiuosi, kad ji
        bus naudinga ir kitiems. Kol kas tai yra labai ankstyva alfa versija,
        bet turėtų veikti gana stabiliai. Šiuo metu programa yra nemokama, bet
        ateityje ji kažkiek kainuos (kaina bus tikrai nedidelė, maždaug kavos
        puodelio kainą už mėnesio abonimentą).
      </Grid>
      <Grid item xs={12}>
        Haiku.lt yra atviro kodo programa ir jos kodą galite rasti čia{' '}
        <a href="https://github.com/daliusd/apskaita">
          https://github.com/daliusd/apskaita
        </a>
        . Jeigu turite idėjų, pasiūlymų ar problemų, jas galite registruoti čia{' '}
        <a href="https://github.com/daliusd/apskaita/issues">
          https://github.com/daliusd/apskaita/issues
        </a>
        .
      </Grid>
    </Grid>
  );
}
