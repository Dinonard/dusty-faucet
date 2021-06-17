import { WsProvider, Keyring, ApiPromise } from '@polkadot/api';
import type { ISubmittableResult } from '@polkadot/types/types';
import { ContractPromise } from '@polkadot/api-contract';

const Message = require('discord.js').Message;
const MNEMONIC = process.env.MNEMONIC!;
const value = 0;
const gasLimit = BigInt(3000) * BigInt(100000);
const AMOUNT = process.env.AMOUNT;
const ADDRESS: string = process.env.ADDRESS?.toString()!;
const ABI = require('./metadata.json');

import type { RegistryTypes } from '@polkadot/types/types';
const typeDefs = require('@plasm/types');
// set up polkadot api
async function polkadotApi() {
    // const provider = new WsProvider('wss://rpc.dusty.plasmnet.io/');
    const provider = await new WsProvider('ws://127.0.0.1:9944');

    let types = typeDefs.dustyDefinitions;
    const api = await new ApiPromise({
        provider,
        types: {
            ...(types as RegistryTypes),
        },
    });
    await api.isReady;
    return api;
}

export const sendTokens = async (args: Array<string>, message: typeof Message) => {
    //create new Polkadot api instance
    let api = await polkadotApi();
    // may need to be GeneralAccountID type
    const to: string = args[0]!;
    const keyring = new Keyring({ type: 'sr25519' });
    const faucetPair = keyring.addFromMnemonic(MNEMONIC);
    const contract = new ContractPromise(api, ABI, ADDRESS);
    await contract.tx.drip({ value, gasLimit }, 123).signAndSend(faucetPair, (result: ISubmittableResult) => {
        if (result.isError) {
            message.reply('There was an error in sending PLD ;(');

            console.log('\nthe above was the result object\n');
            if (result.dispatchError?.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api.registry.findMetaError(result.dispatchError.asModule);
                const { documentation, name, section } = decoded;

                console.log(`${section}.${name}: ${documentation.join(' ')}`);
            } else {
                // Other, CannotLookup, BadOrigin, no extra info
                console.log(result.dispatchError?.toString());
            }
        } else {
            message.reply(`${AMOUNT?.toString()!} PLD sent to ${args[0].toString()!}! Enjoy!`);
            return;
        }
    });
};
