# Summary
NFT marketplace Storefront based on Metaplex protocol which built on top of Solana:


## Features

- **Creating/Minting** non-fungible tokens;
- and **Visualizing** NFTs in a standard way across wallets and applications.
- Randomized Artworks are generated with certain rarity from Assets
- Connect several wallets
- Fullscreen mode
- Cross platform

This marketplace is comprised of two core components: an on-chain program, and a self-hosted front-end web3 application.

## Related

If you want to deep dive on the Architecture, you can do in Metaplex so here:

[Metaplex](https://github.com/metaplex-foundation/metaplex)

https://docs.metaplex.com/

## Tech Stack

**Client:** React Hook, Redux, Typescript, Ant-Design, React-Bootstrap

**Server:** Node, Express

**Framework:** Next.js

**Chain Interface:** solana-web3-cli

**On-chain Program:** Rust, Metaplex, NFT Candy Machine  

## Run Locally

Clone the project

```bash
  git clone https://github.com/black-wyvern-dev/solana_nft_marketplace.git
```

Go to the project directory

```bash
  cd solana_nft_marketplace/js
```

Install dependencies

```bash
  $ yarn install
  $ yarn bootstrap
```

Start the server

```bash
  $ yarn start
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`REACT_APP_STORE_OWNER_ADDRESS_ADDRESS` = Store Owner Phantom Wallet Address

`REACT_APP_PREMINTER_ADDRESS` = Premint Creator Address

`REACT_APP_STORE_ADDRESS` =

`REACT_APP_BIG_STORE` = FALSE

## Rust Programs

The Rust programs have mainly the same features as Metaplex NFT candy machine Program.

## Community

You can resolve your issue on the metaplex channels for contact:

- [Discord](https://discord.gg/metaplex)
- [@metaplex](https://twitter.com/metaplex) on Twitter
- [GitHub Issues](https://github.com/metaplex-foundation/metaplex/issues)

## Storefronts Royalties

All identification on the Storefront is based on wallet addresses. Creators and store admins sign through their wallets, and users place mints from connected wallets.

Each NFT can also be minted with configurable royalty payments that are then sent automatically to the contributors whenever an artwork is minted by someone.

The design and layout of storefronts were customized to suit the needs of a permanent storefront for a specific collection.
