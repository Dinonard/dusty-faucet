# dusty-faucet

- contract/: ink! contract related code (including the deploy tools)

- app/: discord.js bot application or other faucet client apps

- docs/: tutorials, etc.

### Setting Up

Before starting the server, you need to first create a `.env` file with the following variables.

```env
# used for server bots
DISCORD_TOKEN=<discord bot token>
# used for webhook app
WEBHOOK_ID=<discord channel webhook client id>
WEBHOOK_TOKEN=<discord channel webhook client token>
ABI=<ABI of smart contract>
ADDRESS=<address of smart contract>
AMOUNT=<amount of PLD to be sent to requester>
####   MNEMONIC of deployment account
MNEMONIC=<mnemonic of deployment account. used as password to restrict smart contract calls>
```
