PEM="wallet.pem"

PROXY="https://devnet-gateway.multiversx.com"
CHAIN="D"
BYTECODE="output/poap-sc.wasm"
ESDT_SC="erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"

SC_ADDRESS=$(mxpy data load --key=address-devnet 2>/dev/null)
TOKEN_ID=$(mxpy data load --key=tokenId-devnet 2>/dev/null)

deploy() {
    echo ">>> [1/3] Creating SFT collection..."
    issueSFT || return 1

    echo ""
    echo ">>> Identifier token saved: ${TOKEN_ID}"
    echo ""
    echo ">>> [2/3] Deploying contract..."
    deploySC || return 1

    echo ""
    echo ">>> Contract deployed at: ${SC_ADDRESS}"
    echo ""
    echo ">>> [3/3] Assigning roles to the contract..."
    setRoles || return 1

    echo ""
    echo ">>> Deploy complete!"
    echo "    TOKEN_ID:   ${TOKEN_ID}"
    echo "    SC_ADDRESS: ${SC_ADDRESS}"
}

issueSFT() {
    mxpy tx new --send \
        --pem ${PEM} \
        --chain ${CHAIN} \
        --proxy ${PROXY} \
        --receiver ${ESDT_SC} \
        --value 50000000000000000 \
        --data "issueSemiFungible@$(echo -n 'POAPToken' | xxd -p)@$(echo -n 'POAP' | xxd -p)" \
        --gas-limit 60000000 \
        --recall-nonce \
        --outfile="issue-devnet.interaction.json" || return 1

    local TX_HASH=$(mxpy data parse --file="issue-devnet.interaction.json" --expression="data['emittedTransactionHash']")

    echo "Awaiting the transaction confirmation (15sec)..."
    sleep 15

    TOKEN_ID=$(mxpy tx get --hash=${TX_HASH} --proxy=${PROXY} | python3 -c "
import sys, json
tx = json.load(sys.stdin)
for scr in tx.get('transactionOnNetwork', {}).get('smartContractResults', []):
    data = scr.get('data', '')
    if data.startswith('@6f6b@'):
        token_hex = data.split('@')[2]
        print(bytes.fromhex(token_hex).decode())
        break
")

    if [ -z "${TOKEN_ID}" ]; then
        echo "Error: unable to find the token identifier."
        return 1
    fi

    mxpy data store --key=tokenId-devnet --value=${TOKEN_ID} 2>/dev/null
    echo "Token identifier: ${TOKEN_ID}"
}

deploySC() {
    mxpy contract deploy \
        --bytecode ${BYTECODE} \
        --pem ${PEM} \
        --chain ${CHAIN} \
        --proxy ${PROXY} \
        --gas-limit 50000000 \
        --arguments str:${TOKEN_ID} \
        --recall-nonce \
        --send \
        --outfile="deploy-devnet.interaction.json" || return 1

    SC_ADDRESS=$(mxpy data parse --file="deploy-devnet.interaction.json" --expression="data['contractAddress']")
    local TX_HASH=$(mxpy data parse --file="deploy-devnet.interaction.json" --expression="data['emittedTransactionHash']")

    mxpy data store --key=address-devnet --value=${SC_ADDRESS} 2>/dev/null
    mxpy data store --key=deployTransaction-devnet --value=${TX_HASH} 2>/dev/null

    echo "Contract deployed at: ${SC_ADDRESS}"

    echo "Awaiting the deploy confirmation (15sec)..."
    sleep 15
}

setRoles() {
    mxpy tx new --send \
        --pem ${PEM} \
        --chain ${CHAIN} \
        --proxy ${PROXY} \
        --receiver ${ESDT_SC} \
        --data "setSpecialRole@$(echo -n ${TOKEN_ID} | xxd -p)@$(mxpy wallet bech32 --decode ${SC_ADDRESS})@45534454526f6c654e4654437265617465@45534454526f6c654e46544275726e@45534454526f6c654e46544164645175616e74697479" \
        --gas-limit 60000000 \
        --recall-nonce
}

# Use: createEvent <name> <image_url> <end_date_ms> <max_participants>
# Example: createEvent "Event name 2026" "https://example.com/emblem.png" 9999999999999 100
createEvent() {
    local NAME=$1
    local URL=$2
    local END_DATE=$3
    local MAX_PARTICIPANTS=$4

    mxpy contract call ${SC_ADDRESS} \
        --pem ${PEM} \
        --chain ${CHAIN} \
        --proxy ${PROXY} \
        --function createEvent \
        --arguments str:"${NAME}" str:"${URL}" ${END_DATE} ${MAX_PARTICIPANTS} \
        --gas-limit 10000000 \
        --recall-nonce \
        --send
}

# Use: claimEmblem <recipient_address>
claimEmblem() {
    local RECIPIENT=$1

    mxpy contract call ${SC_ADDRESS} \
        --pem ${PEM} \
        --chain ${CHAIN} \
        --proxy ${PROXY} \
        --function claimEmblem \
        --arguments 0x$(mxpy wallet bech32 --decode ${RECIPIENT}) \
        --gas-limit 10000000 \
        --recall-nonce \
        --send
}

# Use: finalizeEvent
finalizeEvent() {
    mxpy contract call ${SC_ADDRESS} \
        --pem ${PEM} \
        --chain ${CHAIN} \
        --proxy ${PROXY} \
        --function finalizeEvent \
        --gas-limit 10000000 \
        --recall-nonce \
        --send
}

# Use: getActiveEvent <organizer_address>
getActiveEvent() {
    local ORGANIZER=$1

    mxpy contract query ${SC_ADDRESS} \
        --proxy ${PROXY} \
        --function getActiveEvent \
        --arguments 0x$(mxpy wallet bech32 --decode ${ORGANIZER})
}

# Use: hasClaimed <event_id> <address>
hasClaimed() {
    local EVENT_ID=$1
    local ADDRESS=$2

    mxpy contract query ${SC_ADDRESS} \
        --proxy ${PROXY} \
        --function hasClaimed \
        --arguments ${EVENT_ID} 0x$(mxpy wallet bech32 --decode ${ADDRESS})
}