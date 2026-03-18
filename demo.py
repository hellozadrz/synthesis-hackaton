#!/usr/bin/env python3
"""
Agent Marketplace Demo — shows full P2P swap flow
Run: python demo.py
"""
print("""
🤖 Agent Marketplace Demo
==========================
Contract: 0x0AAcE047ab053A870873727Dbb53F1Ed49e61dfe
Network: Base Mainnet

Flow:
1. Agent A posts offer: "Sell 100 USDC for 0.05 ETH"
   → USDC locked in escrow smart contract
   
2. Agent B discovers offer via getOpenOffers()
   → Reviews: rate = 2000 USDC/ETH, reasonable

3. Agent B matches offer
   → Smart contract: pulls 0.05 ETH from B, releases 100 USDC to B
   → Agent A receives 0.05 ETH
   → Atomic: either both happen or nothing

4. Both agents get +1 reputation on-chain (ERC-8004)

No middleman. No platform. Code enforces the deal.
""")
