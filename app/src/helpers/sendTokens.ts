import { Keyring } from '@polkadot/api';
import type { ISubmittableResult } from '@polkadot/types/types';
import { ContractPromise } from '@polkadot/api-contract';

const Message = require('discord.js').Message;
const MNEMONIC = process.env.MNEMONIC!;
const value = 0;
const gasLimit = -1;
const AMOUNT = process.env.AMOUNT;
const ADDRESS: string = process.env.ADDRESS?.toString()!;
const ABI = require('./metadata.json');

export const sendTokens = async (args: Array<string>, message: typeof Message, api: any) => {
    //create new Polkadot api instance
    // may need to be GeneralAccountID type
    const to: string = args[0]!;
    const keyring = new Keyring({ type: 'sr25519' });
    const faucetPair = keyring.addFromMnemonic(MNEMONIC);
    const contract = new ContractPromise(api, ABI, ADDRESS);
    // could do detailed error messages, but would require heavier dependencies that git
    // in the way to deploying to size-constrained glitch server.
    try {
        await contract.tx.drip(value, gasLimit, to).signAndSend(faucetPair, (result: ISubmittableResult) => {
            if (result.isError) {
                message.reply('There was an error in sending PLD ;(');
                if (result.dispatchError?.isModule) {
                    // for module errors, we have the section indexed, lookup
                    const decoded = api.registry.findMetaError(result.dispatchError.asModule);
                    const { documentation, name, section } = decoded;

                    console.log(`${section}.${name}: ${documentation.join(' ')}`);
                } else {
                    // Other, CannotLookup, BadOrigin, no extra info
                    console.log(result.dispatchError?.toString());
                }
            } else if (result.isFinalized) {
                message.reply(`${AMOUNT?.toString()!} PLD sent to ${args[0].toString()!}! Enjoy!`);
                return;
            }
        });
    } catch (e) {
        message.reply('invalid usage. Please check your address!');
        console.log('Error in sendTokens.ts: {}', e);
    }
};
