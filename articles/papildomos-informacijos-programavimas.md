---
title: 'Papildomos informacijos programavimas'
date: '2024-06-16'
modified: '2024-06-16'
---

Tai yra funkcionalumas pažengusiems leidžiantis keisti papildomą informaciją
sąskaitoje faktūroje priklausomai nuo to kas įvesta kituose laukuose. Jeigu
nesate programuotoja(s) mano pasiūlymas būtų tiesiog peržiūrėti pavyzdžius
žemiau, pasirinkti jums tinkamą/reikiamą ir pritaikyti pagal savo poreikius.

## Pavyzdžiai

Čia rasite įvairių pavyzdžių, kuriuos galite naudoti [Nustatymų
puslapio](/nustatymai) „Papildomos informacijos programa“ sekcijoje.

### Nurodyti konkrečią apmokėjimo datą pagal SF datą

```js
const poKiekDienu = 10;
date.setDate(date.getDate() + poKiekDienu);
globalThis.result = `Prašome apmokėti sąskaitą iki ${formatDate(date)}`;
```

Kuriant sąskaitą faktūrą prie „Papildoma informacija“ lauko atsiras mygtukas
„Vykdyti papildomos informacijos programą“, kurį paspaudus papildomos
informacijos lauke atsiras eilutė panaši į „Prašome apmokėti sąskaitą iki
2024-06-26“.

### Nurodyti konkrečią apmokėjimo datą pagal SF datą (automatiškai)

```js
// AUTO
const poKiekDienu = 10;
date.setDate(date.getDate() + poKiekDienu);
globalThis.result = `Prašome apmokėti sąskaitą iki ${formatDate(date)}`;
```

Pakeitus sąskaitos faktūros datą ar bet kurį kitą laukelį papildomos
informacijos laukelis pasikeis automatiškai. Turėkite omeny, kad šis laukas bus
perrašomas automatiškai ir jūsų pakeitimai gali dingti. Todėl naudokite
automatinį variantą (pirma eilutė `// AUTO`) tik tada, kai norite, kad
papildoma informacija atrodytų taip pat.

### Nurodyti konkrečia apmokėjimo datą pagal SF datą ir kalbą (automatiškai)

```js
// AUTO
const poKiekDienu = 10;
date.setDate(date.getDate() + poKiekDienu);
if (language == 'lt') {
  globalThis.result = `Prašome apmokėti sąskaitą iki ${formatDate(date)}`;
} else if (language === 'en') {
  globalThis.result = `Please process by ${formatDate(date)}`;
}
```

### Nurodyti apmokėjimo būdą priklausomai nuo pirkėjo ar sumos

```js
let result = 'Prašome apmokėti sąskaitą';
if (buyer.startsWith('UAB') || buyer.startsWith('AB') || price > 5000) {
  result += ' BANKINIU PAVEDIMU';
} else {
  result += ' GRYNAIS';
}
globalThis.result = result;
```

Šiame pavyzdyje, jei pirkėjo laukelyje informacija prasideda raidėmis „UAB“ ar
„AB“ arba SF suma yra daugiau negu 50 eurų (sumos programai paduodamos centais
todėl nurodyta 5000), tai tada apmokėjimo prašome pavedimu. Kitu atveju
pavedimo prašome grynais.

### Informacijos apjungimas

Ir žinoma galima apjungti šią informaciją, jei norime nurodyti ir apmokėjimo
datą ir atsiskaitymo būdą.

```js
const poKiekDienu = 10;
date.setDate(date.getDate() + poKiekDienu);
let result = `Prašome apmokėti sąskaitą iki ${formatDate(date)}\n`;

result += 'Atsiskaitymas ';
if (buyer.startsWith('UAB') || buyer.startsWith('AB') || price > 5000) {
  result += ' BANKINIU PAVEDIMU';
} else {
  result += ' GRYNAIS';
}
globalThis.result = result;
```

## Informacija programuojantiems

Papildomos informacijos programa yra rašoma JavaScript programavimo kalba.

Programa gauna šią informaciją:

- `invoiceType` - SF tipas. Gali būti `standard`, `proforma` arba `credit`.
- `seriesName` - serijos vardas
- `seriesId` - serijos numeris
- `date` - SF data
- `language` - kalba
- `seller` - pardavėjo informacija
- `buyer` - pirkėjo informacija
- `issuer` - SF išrašęs asmuo
- `items` - paslaugų ar prekių masyvas
- `price` - SF prekių ar paslaugų suma centais

Taip gali atrodyti duomenys paduoti programai:

```js
const invoiceType = 'standard';
const seriesName = 'DD';
const seriesId = 47;
const date = new Date(1718540924628);
const language = 'lt';
const seller = 'Pirkėjas';
const buyer = 'Pardavėjas';
const email = '';
const issuer = 'Dalius Dobravolskas';
const items = [{ id: 0, name: '', unit: 'vnt.', amount: 1, price: 0 }];
const price = 0;
```

Jei pirma programos eilutė yra komentaras `// AUTO`, tai programa bus vykdoma
kaskart pasikeitus laukams.

```js
// AUTO
```

`formatDate` yra tik pagalbinė funkcija, kuri suformatuoja datą
YYYY-MM-DD formatu, pvz.: 2024-06-26
