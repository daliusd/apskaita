# Haiku.lt

Individualios veiklos apskaita.

## Programavimas

Sukurkite `.local.env` failą su šiuo turiniu. Nurodykite tinkamus
Google autentikacijos parametrus:

```sh
NEXTAUTH_URL=http://localhost:3000
GOOGLE_ID=
GOOGLE_SECRET=
```

Papildomai galima naudoti `CRED_PASSWORD`, jei norite prisijungti
kaip bet koks vartotojas.

```sh
CRED_PASSWORD=testpass
```

Šis kintamasis naudojamas testavime, bet nustačius aukšto saugumo
slaptažodį galima naudoti vartotojų impersonavimui.
