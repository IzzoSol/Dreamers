# Dreamers NFT System

NFTs are the bridge between the game, the token, and the real-world creative economy. Every NFT purchase burns $DREAM, funds artists, and unlocks in-game content.

## NFT Categories

### 1. Character Skins (Game NFTs)
- Unique player skins for Dreamers Climb
- Owning the NFT unlocks the skin in-game
- Rarity tiers: Common, Rare, Epic, Legendary, Mythic
- Mint cost: $DREAM tokens (burned on mint)

### 2. Music NFTs
- Izzo's tracks as collectible NFTs
- Holders get early access, exclusive versions, royalty splits
- Links music career directly to ecosystem revenue

### 3. Art NFTs
- From the Artist Showcase — independent creators mint through the platform
- Artists keep 85-90% of primary sale
- Secondary royalties enforced on-chain

### 4. Achievement NFTs (Soulbound)
- Non-transferable badges for game milestones
- First 1000m, First Boss Kill, 10,000 Coins Lifetime
- Free to earn, can't be bought

### 5. Event / Season NFTs
- Limited edition drops tied to game seasons or real events
- Time-gated minting windows
- Previous seasons become rare/valuable

## NFT ↔ Token Loop

```
Player buys NFT with $DREAM
    → $DREAM burned (deflationary)
    → NFT unlocks game content
    → Game content earns more $DREAM
    → Player buys more NFTs or trades on marketplace
```

## Technical Implementation

- **Standard:** Metaplex NFT standard on Solana
- **Minting:** Candy Machine or custom program
- **Metadata:** Arweave (permanent, decentralized)
- **In-game check:** `ownsNFT(mintAddress)` integrated in game code
- **Marketplace:** Magic Eden, Tensor, or custom marketplace

## Revenue Model

| Event | $DREAM Burned | Treasury | Artist | Dev |
|-------|--------------|----------|--------|-----|
| Skin mint | 40% | 20% | — | 40% |
| Music NFT mint | 20% | 10% | 60% | 10% |
| Art NFT mint | 10% | 5% | 80% | 5% |
| Secondary sale | 2% | 2% | 4% | 2% |
