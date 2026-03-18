#!/usr/bin/env python3
"""Agent Marketplace — Agent Logic
Browse open offers, find matching counterparties, execute atomic swaps.
"""
from web3 import Web3
import json, os, time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / 'trading/.env')

CONTRACT = "0x0AAcE047ab053A870873727Dbb53F1Ed49e61dfe"
ABI = json.loads(Path(__file__).parent / "artifacts/contracts/AgentMarketplace.sol/AgentMarketplace.json").read_text())["abi"]

def get_contract():
    w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))
    return w3, w3.eth.contract(address=Web3.to_checksum_address(CONTRACT), abi=ABI)

def browse_offers():
    w3, contract = get_contract()
    ids = contract.functions.getOpenOffers(1, 20).call()
    offers = []
    for id in ids:
        o = contract.functions.offers(id).call()
        offers.append({"id": id, "agent": o[0], "sellToken": o[1], "buyToken": o[2],
                       "sellAmount": o[3], "buyAmount": o[4], "expiresAt": o[7]})
    return offers

def create_offer(sell_token, buy_token, sell_amount, buy_amount, duration=86400):
    w3, contract = get_contract()
    key = os.environ["ETH_BOT_KEY"]
    addr = os.environ["ETH_BOT_ADDRESS"]
    # Approve first
    erc20_abi = [{"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
    token = w3.eth.contract(address=Web3.to_checksum_address(sell_token), abi=erc20_abi)
    nonce = w3.eth.get_transaction_count(addr)
    tx = token.functions.approve(CONTRACT, sell_amount).build_transaction({"from": addr, "nonce": nonce, "gas": 100000, "gasPrice": w3.eth.gas_price})
    signed = w3.eth.account.sign_transaction(tx, key)
    w3.eth.send_raw_transaction(signed.raw_transaction)
    # Create offer
    nonce += 1
    tx2 = contract.functions.createOffer(sell_token, buy_token, sell_amount, buy_amount, duration).build_transaction({"from": addr, "nonce": nonce, "gas": 200000, "gasPrice": w3.eth.gas_price})
    signed2 = w3.eth.account.sign_transaction(tx2, key)
    tx_hash = w3.eth.send_raw_transaction(signed2.raw_transaction)
    return tx_hash.hex()

if __name__ == "__main__":
    print("Browsing open offers...")
    offers = browse_offers()
    print(f"Found {len(offers)} open offers")
    for o in offers:
        print(f"  #{o['id']}: sell {o['sellAmount']} {o['sellToken'][:10]}... for {o['buyAmount']} {o['buyToken'][:10]}...")
