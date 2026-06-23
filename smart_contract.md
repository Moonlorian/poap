# Devnet demo address list

### Wallet: Smart contract owner
```
erd1xs7rel2dy05xr0unqmwv86cm4e9ccz93t4fsu880fkznk33nmkask27mld 
```

### Smart contract
```
erd1qqqqqqqqqqqqqpgq5prfr0ynhtsgu5x885hddsfdz2zcz00pmkasp9cmd6
```

### SFT collection id
```
POAP-042a5d
```

### Test organizer/client wallets
```
erd1xs7rel2dy05xr0unqmwv86cm4e9ccz93t4fsu880fkznk33nmkask27mld
erd1rgg9gtra4v4re4jm307dua7ucmhfty7zcm8s2fuldwqdz8eav9hqqvz6xx
erd1z47eqc5q7ztzf59f7yph99wrg4legarmc84xt4h33h0vcy0s4r6sle6wjv
```

# Deploy commands

### Create wallet
```
mxpy wallet new --format pem --outfile <WALLET_FILE_NAME>.pem
```

### Create SFT collection
```
mxpy tx new --send \
  --pem <WALLET_FILE_ROUTE>.pem \
  --chain D \
  --proxy https://devnet-gateway.multiversx.com \
  --receiver erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u \
  --value 50000000000000000 \
  --data "issueSemiFungible@$(echo -n 'POAPToken' | xxd -p)@$(echo -n 'POAP' | xxd -p)" \
  --gas-limit 60000000 \
  --recall-nonce
```

### Deploy contract
```
mxpy contract deploy \
  --bytecode <output/poap-sc.wasm> \
  --pem <WALLET_FILE_ROUTE>.pem \
  --chain D \
  --proxy https://devnet-gateway.multiversx.com \
  --gas-limit 50000000 \
  --arguments str:<SFT_TOKEN_IDENTIFIER> \
  --recall-nonce \
  --send
```

### Assign roles to the contract
```
mxpy tx new --send \
  --pem <WALLET_FILE_ROUTE>.pem \
  --chain D \
  --proxy https://devnet-gateway.multiversx.com \
  --receiver erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u \
  --data "setSpecialRole@$(echo -n 'POAP-042a5d' | xxd -p)@$(mxpy wallet bech32 --decode <SC_ADDRESS>)@45534454526f6c654e4654437265617465@45534454526f6c654e46544275726e@45534454526f6c654e46544164645175616e74697479" \
  --gas-limit 60000000 \
  --recall-nonce
```
# Usage commands

### Create event
```
mxpy contract call <SC_ADDRESS> \
  --pem <WALLET_FILE_ROUTE>.pem \
  --chain D \
  --proxy https://devnet-gateway.multiversx.com \
  --function createEvent \
  --arguments str:"<EVENT_NAME>" str:"<EMBLEM_URL>" <TIMESTAMP_MILLISECONDS> <MAX_PARTICIPANTS> \
  --gas-limit 10000000 \
  --recall-nonce \
  --send
```

### Get active event
```
mxpy contract query <SC_ADDRESS> \
  --proxy https://devnet-gateway.multiversx.com \
  --function getActiveEvent \
  --arguments 0x$(mxpy wallet bech32 --decode <ORGANIZER_ADDRESS>)
```

### Claim event emblem
```
mxpy contract call <SC_ADDRESS> \
  --pem <WALLET_FILE_ROUTE>.pem \
  --chain D \
  --proxy https://devnet-gateway.multiversx.com \
  --function claimEmblem \
  --arguments 0x$(mxpy wallet bech32 --decode <RECIEVER_ADDRESS>) \
  --gas-limit 10000000 \
  --recall-nonce \
  --send
```

### Check if the event was claimed
```
mxpy contract query <SC_ADDRESS> \
  --proxy https://devnet-gateway.multiversx.com \
  --function hasClaimed \
  --arguments <EVENT_ID> 0x$(mxpy wallet bech32 --decode <RECIEVER_ADDRESS>)
```

### Finalize event
```
mxpy contract call <SC_ADDRESS> \
  --pem <WALLET_FILE_ROUTE>.pem \
  --chain D \
  --proxy https://devnet-gateway.multiversx.com \
  --function finalizeEvent \
  --gas-limit 10000000 \
  --recall-nonce \
  --send
```
