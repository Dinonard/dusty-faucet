import { Keyring } from '@polkadot/api';
import type { ISubmittableResult } from '@polkadot/types/types';
import { ContractPromise } from '@polkadot/api-contract';

const Message = require('discord.js').Message;
const MNEMONIC = process.env.MNEMONIC!;
const value = 0;
const gasLimit = BigInt(3000) * BigInt(100000);
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
    await contract.tx.drip({ value, gasLimit }, to).signAndSend(faucetPair, (result: ISubmittableResult) => {
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
