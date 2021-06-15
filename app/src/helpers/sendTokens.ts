import { WsProvider, Keyring, ApiPromise } from '@polkadot/api';
// const WsProvider = require('@polkadot/api').WsProvider;
// const Keyring = require('@polkadot/api').Keyring;
// const ApiPromise = require('@polkadot/api').ApiPromise;

// import { cryptoWaitReady, checkAddress } from '@polkadot/util-crypto'; //TODO check input address
// import { formatBalance } from '@polkadot/util'; //TODO check input address
// import { Balance } from '@polkadot/types/interfaces'; //TODO check input address
// import { createType, GenericAccountId } from '@polkadot/types'; //TODO check input address
import type { RegistryTypes } from '@polkadot/types/types';
const typeDefs = require('@plasm/types');
import type { ISubmittableResult } from '@polkadot/types/types';

import { ContractPromise } from '@polkadot/api-contract';
// const ContractPromise = require('@polkadot/api-contract').ContractPromise;

const Message = require('discord.js').Message;

const MNEMONIC = process.env.MNEMONIC!;
const value = 0;
const gasLimit = BigInt(3000) * BigInt(100000);
const AMOUNT = process.env.AMOUNT;

const ADDRESS: string = process.env.ADDRESS?.toString()!;
const ABI = require('./metadata.json');

export const sendTokens = async (args: Array<string>, message: typeof Message) => {
    // may need to be GeneralAccountID type
    const to: string = args[0]!;
    const keyring = new Keyring({ type: 'sr25519' });
    const faucetPair = keyring.addFromMnemonic(MNEMONIC);

    const provider = new WsProvider('wss://rpc.dusty.plasmnet.io/');
    // const provider = new WsProvider('wss://127.0.0.1:9944');
    let types, networkPrefix;

    networkPrefix = 5;
    types = typeDefs.dustyDefinitions;
    const api = await new ApiPromise({
        provider,
        types: {
            ...(types as RegistryTypes),
        },
    });

    await api.isReady;

    const contract = new ContractPromise(api, ABI, ADDRESS);
    await contract.tx.drip({ value, gasLimit }, to).signAndSend(faucetPair, (result: ISubmittableResult) => {
        if (result.isError) {
            message.reply('There was an error in sending PLD ;(');
            console.log(result);
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
        }
    });
};
