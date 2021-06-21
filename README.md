# dusty-faucet

- contract/: ink! contract related code (including the deploy tools)

- app/: discord.js bot application or other faucet client apps

- docs/: tutorials, etc.

code to deploy here:
https://github.com/PlasmNetwork/dusty-faucet-deploy

### Setting Up

Before starting the server, you need to first create a `.env` file in the app/build directory with the following variables.

```env
# used for server bots
DISCORD_TOKEN=<discord bot token>

ADDRESS=<address of smart contract>
AMOUNT=<amount of PLD to be sent to requester>
####   MNEMONIC of deployment account
MNEMONIC=<mnemonic of deployment account. to give all privlidges to the polkadot.js api when calling the smart contract>
# cooldown for drip command in seconds
DRIP_COOLDOWN = "3600"
```

If you deploy a new smart contract that you want to interact with, update the ADDRESS, MNEMONIC, and copy paste the `metadata.json` at `contract/target/ink/metadata.json` to app/build/helpers. This will update the ABI, ADDRESS, and Keys used to sign the contract when interacting with the smart contract via polkadot.js.
