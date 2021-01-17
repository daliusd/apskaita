import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

export default function Apie() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Naudojimo sąlygos
        </Typography>
      </Grid>
      <Grid item xs={12}>
        „Haiku.lt“ suteikia paprastą ir greitą būdą valdyti sąskaitas faktūras.
        Prieš naudojant „Haiku.lt“ puslapį turite peržiūrėti naudojimo sąlygas
        išdėstytas apačioje. Naudodamas sistemą (Vartotojas) sudaro sutartį su
        Daliumi Dobravolsku - „Haiku.lt“ savininku (Savininku):
        <ul>
          <li>
            Vartotojas sutinka, kad Savininkas laikys tam tikrą privačią
            informaciją apie jį/ją kaip nurodyta privatumo politikoje.
          </li>
        </ul>
      </Grid>
    </Grid>
  );
}
