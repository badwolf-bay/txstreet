# Local mirror of storage.txstreet.com

Wiki texts shown in the stats and house popups, copied from
`https://storage.txstreet.com/info/wiki/` on 2026-10-22 so the app no longer
depends on that server. Served at `/static/storage/` (`VUE_APP_STORAGE_URL`).

Not mirrored:
- `info/wiki/common/stats/transaction-fees.json`: never existed (the XMR fee stat now links to `common/transaction-fees` like the other chains).
- `info/houses/*/index.html`: only `ETH_opensea` existed, a MoonHeads/OpenSea promo.
- NFT avatar images (`<collection>/<id>`): depend on Ethereum NFT ownership data.
