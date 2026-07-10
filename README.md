# POAP - Protocol de Prova d'Assistència

Sistema de distribució d'emblemes digitals (SFT) sobre la blockchain MultiversX. Permet a professors crear sessions verificades i als alumnes reclamar-ne l'assistència mitjançant QR.


## Guies d'ús

### [Guia Alumne](/Guia%20Alumne.pdf) 

### [Guia Professor](/Guia%20Professor.pdf)

---

## Estructura del repositori

```
poap/
├── poap-sc/       # Smart contract (Rust / MultiversX SC framework)
└── poap-dapp/     # Aplicació web (React + Vite)
```

---

## Smart Contract (`poap-sc`)

### Tecnologies

- Rust - [MultiversX SC framework](https://docs.multiversx.com/developers/smart-contracts)
- sc-meta - per a compilació i desplegament
- SFT natiu de MultiversX per representar els emblemes

### Lògica del contracte

El contracte gestiona events (una classe per als usuaris). Cada event pertany a un organitzador i té associada una col·lecció de SFTs que es distribueixen als participants.

Un organitzador només pot tenir un event actiu simultàniament. En finalitzar (manualment o per expiració), els SFTs no distribuïts es cremen.

### Camps d'un event

`event_id`: identificador unic del event. <br>
`organizer`: adreça del organitzador (professor). <br>
`token_nonce`: identificador nonce de la col·lecció SFT. <br><br> 
`name`: nom / titol. <br>
`emblem_url`: URL de l'imatge del emblema. <br>
`start_date`: data de creació. <br><br>
`end_date`: data durant la cual l'event es valid. <br>
`max_participants`: limit d'emblemes a reclamar. <br>
`current_participants`: numero d'emblemes reclamats. <br>
`is_stopped`: finalitzacio anticipada de l'event. <br>

### Endpoints

| Funció | Tipus | Descripció |
|---|---|---|
| `createEvent(name, url, end_date, max_participants)` | write | Crea un event i minteja els SFTs necessaris |
| `claimEmblem(recipient)` | write | Transfereix un SFT al recipient. Ha de ser cridat per l'organitzador |
| `finalizeEvent()` | write | Finalitza l'event i crema els SFTs restants |
| `getActiveEvent(organizer)` | query | Retorna l'event actiu d'un organitzador, o buit si no n'hi ha |
| `hasClaimed(event_id, address)` | query | Comprova si una adreça ja ha reclamat un event concret |

### Restriccions del contracte

- `end_date` ha de ser futura respecte al timestamp del bloc
- `max_participants` entre 1 i 9999
- Si l'organitzador ja té un event actiu i no ha expirat, no pot crear-ne un de nou
- Un recipient no pot reclamar el mateix event dues vegades
- `claimEmblem` falla si l'event està aturat, ha expirat o és ple

### Desplegament (devnet)

**1. Navegar al directori**
```bash
# Entra en el directori del smart contract
cd poap-sc
```

**2. Crear wallet**
```bash
# Crea una wallet dins de /poap-sc per al script
mxpy wallet new --format pem --outfile wallet.pem
```

**3. Compilar el contracte**
```bash
# Verifica que passa els tests i fes una build
cargo test
sc-meta all build
```
**4. Executar el script de deploy**
```bash
# Crea la col·lecció SFT, desplegara el contracte i asignara els rols
source interaction/snippets.sh
deploy
```

### Adreces devnet actuals

| Recurs | Adreça |
|---|---|
| Smart contract | `erd1qqqqqqqqqqqqqpgq69963edk52a44chukh2vtsakn6fgqe7xmkaslagtxf` |
| Col·lecció SFT | `POAP-c635f3` |
| Owner | `erd1xs7rel2dy05xr0unqmwv86cm4e9ccz93t4fsu880fkznk33nmkask27mld` |

### Interacció directa via script `snippets.sh`

```bash
# Asegura que tens la wallet amb el .pem en el directori /poap-sc
# La wallet .pem sera l'organitzador per defecte en totes les funcions
source interaction/snippets.sh

# Crear una nova classe, l'organitzador sent la wallet .pem
# Exemple: createEvent "Event name 2026" "https://example.com/emblem.png" 1783611497469 100
createEvent <name> <image_url> <end_date_ms> <max_participants>

# Reclamar el emblema del organitzador amb adreça .pem
claimEmblem <recipient_address>

# Finalitza l'event del organitzador .pem
finalizeEvent

# Busca l'event actiu d'una adreça qualsevol
getActiveEvent <organizer_address>

# Busca si una adreça ha reclamat l'event amb un ID especific
hasClaimed <event_id> <address>
```

### Interacció directa via `mxpy`

```bash
# Consultar event actiu d'un organitzador
mxpy contract query <SC_ADDRESS> \
  --proxy https://devnet-gateway.multiversx.com \
  --function getActiveEvent \
  --arguments 0x$(mxpy wallet bech32 --decode <ORGANIZER_ADDRESS>)

# Comprovar si una adreça ha reclamat un event
mxpy contract query <SC_ADDRESS> \
  --proxy https://devnet-gateway.multiversx.com \
  --function hasClaimed \
  --arguments <EVENT_ID> 0x$(mxpy wallet bech32 --decode <ADDRESS>)

# Finalitzar event manualment
mxpy contract call <SC_ADDRESS> \
  --pem wallet.pem \
  --chain D \
  --proxy https://devnet-gateway.multiversx.com \
  --function finalizeEvent \
  --gas-limit 10000000 \
  --recall-nonce \
  --send
```

---

## DApp (`poap-dapp`)

### Tecnologies

- React + Vite
- `@multiversx/sdk-core` i `@multiversx/sdk-dapp` per a interacció amb la blockchain
- Tailwind CSS + CSS personalitzat (`poap.css`)
- Desplegada a GitHub Pages amb `basename` configurat via `BASE_URL` de Vite

### Configuració

Les constants de xarxa estan a `src/config/`:

| Variable | Fitxer | Descripció |
|---|---|---|
| `contractAddress` | `config.devnet.js` | Adreça del smart contract |
| `tokenId` | `config.devnet.js` | Identificador de la col·lecció SFT |
| `PROXY_URL` | `config.devnet.js` | Endpoint del proxy de MultiversX |
| `chainId` | `sharedConfig.js` | Identificador de cadena (`D` per devnet) |
| `EMBLEM_IMAGES` | `sharedConfig.js` | Llista d'imatges predefinides per als emblemes |


### Instal·lació i execució local

```bash
cd poap-dapp
yarn
yarn start-devnet
```

### Build i desplegament a GitHub Pages

```bash
yarn
yarn deploy
```

El `vite.config.js` ha de tenir `base` configurat amb el nom del repositori:
```js
export default defineConfig({
  base: '/poap/',
  // ...
})
```

### Flux d'autenticació

L'autenticació es fa via MultiversX Web Wallet. Les rutes marcades amb `authenticatedRoute: true` a `routes.js` redirigeixen a `/?redirect=<ruta>` si no hi ha sessió activa. Un cop autenticat, `LoginPage` llegeix el paràmetre `redirect` i navega a la ruta original.

### Flux del professor

1. Autenticació amb Web Wallet
2. Selecció de rol: Professor
3. Importació de clau (keystore JSON o PEM) necessària per signar les transaccions de claim en nom propi
4. Creació d'event: nom, imatge de l'emblema, data de finalització, màxim de participants
5. Visualització del QR: conté l'adreça de l'organitzador i la clau PEM xifrada
6. Finalització manual de l'event quan sigui necessari

### Flux de l'alumne

1. Escaneig del QR (o introducció manual de la URL)
2. Si no hi ha sessió activa, redirecció al login i tornada automàtica a la URL del QR
3. `ClaimPage` crida `claimEmblem` al contracte via la clau de l'organitzador inclosa al QR
4. Espera de confirmació a la blockchain i posterior indexació a la API
5. Visualització de l'emblema obtingut

## FAQ
 
**Per què hi ha una opció de clau PEM si els usuaris fan servir keystore JSON?**
 
El keystore JSON és el format recomanat perquè inclou la clau privada xifrada amb contrasenya, cosa que el fa més segur d'emmagatzemar i compartir. L'opció PEM existeix com a alternativa per a entorns tècnics o de desenvolupament on ja es treballa directament amb fitxers PEM (per exemple, desplegaments automatitzats o tests amb `mxpy`). Per a un ús normal de l'aplicació, el keystore JSON és suficient.
 
---
 
**Què passa si perdo la contrasenya del wallet?**
 
No hi ha cap mecanisme de recuperació. La contrasenya xifra la clau privada localment i no s'emmagatzema en cap servidor. Si es perd la contrasenya, la clau privada és inaccessible i el wallet queda inutilitzable. Cal crear un wallet nou i, si s'era professor amb un event actiu, el contracte no podrà rebre noves reclamacions fins que no es crei un nou event des del wallet nou.
 
---
 
**Per què el professor necessita xEGLD per crear una classe?**
 
A la blockchain de MultiversX, qualsevol operació que escriu dades (com crear una classe o distribuir emblemes) consumeix una petita quantitat de la criptomoneda nativa de la xarxa (xEGLD en el cas del devnet). Això és un mecanisme de la pròpia xarxa per evitar spam i pagar als validadors que processen les operacions. No és un cost de l'aplicació: és el cost mínim d'operar sobre la blockchain. Al devnet, aquest xEGLD no té valor real i es pot obtenir gratuïtament des del [faucet oficial](https://devnet-wallet.multiversx.com/faucet).
 
---
 
**Els alumnes també necessiten xEGLD per reclamar un emblema?**
 
No. La transacció de claim la signa i paga el professor, no l'alumne. L'alumne només necessita tenir un wallet de MultiversX per rebre l'emblema, però no necessita cap saldo per iniciar el procés.
 
---
 
**L'emblema obtingut es perd si l'alumne tanca l'aplicació?**
 
No. Els emblemes són SFTs (Semi-Fungible Tokens) emmagatzemats directament a la blockchain, associats a l'adreça de l'alumne de forma permanent. L'aplicació només els llegeix i mostra; no en té cap còpia local. Es poden consultar en qualsevol moment des de qualsevol explorador de MultiversX o des de la mateixa aplicació tornant a autenticar-se.
