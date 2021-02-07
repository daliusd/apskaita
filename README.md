# Haiku.lt

Individualios veiklos apskaita.

## Programavimas

Sukurkite `.env.local` failą su šiuo turiniu. Nurodykite tinkamus
Google autentikacijos parametrus:

```sh
NEXTAUTH_URL=http://localhost:3000
GOOGLE_ID=
GOOGLE_SECRET=
USER_DATA_PATH=./data
```

`USER_DATA_PATH` direktorija privalo egzistuoti.

Papildomai galima naudoti `CRED_PASSWORD`, jei norite prisijungti
kaip bet koks vartotojas.

```sh
CRED_PASSWORD=testpass
```

Šis kintamasis naudojamas testavime, bet nustačius aukšto saugumo
slaptažodį galima naudoti vartotojų impersonavimui.

### DB pastaba

Jeigu sukuriama nauja migracija, ji turėtų būti paleista ant
egzistuojančių duombazių prieš naudojant kokį nors funkcionalumą
su tomis duombazėmis, kuris būtų paremtas ta migracija. Tai
reiškia, kad migracija turėtų būti deploy'inta prieš
funkcionalumą.
