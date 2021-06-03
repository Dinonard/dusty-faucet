import { WsProvider, Keyring, ApiPromise} from "@polkadot/api";
import { cryptoWaitReady, checkAddress } from "@polkadot/util-crypto";
import { formatBalance } from "@polkadot/util";
import { Balance } from "@polkadot/types/interfaces";
import { createType, GenericAccountId } from "@polkadot/types";
import type { RegistryTypes } from '@polkadot/types/types';
import typeDefs from '@plasm/types';
import { ContractPromise } from '@polkadot/api-contract';
import { Message } from "discord.js";


const ABI = process.env.ABI
const MNEMONIC = process.env.MNEMONIC!
const value = 0
const gasLimit = 3000n * 100000n;
const AMOUNT = process.env.AMOUNT;


const ADDRESS: string = process.env.ADDRESS?.toString()!

export const sendTokens = async (args: Array<string>, message: Message) => {
  const to: string = args[0]!;
const keyring = new Keyring({ type: "sr25519" });
const faucetPair = keyring.addFromMnemonic(MNEMONIC);


  const provider = new WsProvider("wss://rpc.dusty.plasmnet.io");
  let types, networkPrefix;
  // let network = args[0].toString().toLowerCase()
  // use if we want to switch between networks
    networkPrefix = 5;
    types = typeDefs.dustyDefinitions;
  const api = new ApiPromise({
    provider,
    types: {
      ...(types as RegistryTypes),
    },
  });


  const contract = new ContractPromise(api, ABI, ADDRESS);
  await contract.tx.drip({value, gasLimit}, to, MNEMONIC).signAndSend(faucetPair, ({status, events, dispatchError}) => {
    if (dispatchError) {
      if (dispatchError.isModule) {
        // for module errors, we have the section indexed, lookup
        const decoded = api.registry.findMetaError(dispatchError.asModule);
        const { documentation, name, section } = decoded;

        console.log(`${section}.${name}: ${documentation.join(' ')}`);
      } else {
        // Other, CannotLookup, BadOrigin, no extra info
        console.log(dispatchError.toString());
      }
    } else {
      message.channel.send(`${AMOUNT?.toString()!} PLD sent to ${args[0].toString()!}! Enjoy!`)
    }
    
  })


}