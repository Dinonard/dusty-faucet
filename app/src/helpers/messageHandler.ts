import type { Message, TextChannel } from 'discord.js';
import type { RegistryTypes } from '@polkadot/types/types';
import typeDefs from '@plasm/types';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { client } from '../app';
import { commands } from '../app';
import { cooldowns } from '../app';
import { Command } from './command';

const prefix = '/';
// set up polkadot api
async function polkadotApi() {
    const provider = new WsProvider('wss://rpc.dusty.plasmnet.io/');
    // const provider = await new WsProvider('ws://127.0.0.1:9944');
    const types = typeDefs.dustyDefinitions;
    const api = new ApiPromise({
        provider,
        types: {
            ...(types as RegistryTypes),
        },
    });
    await api.isReadyOrError.catch((reason) => {
        console.log(`Failed to initialize polkadot api: {}`, reason);
    });
    return api;
}

export const messageHandler = async (message: Message) => {
    if (!message.channel.isText) return;
    if ((message.channel as TextChannel).name !== 'faucet') return;
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    //error checking

    const command: Command = commands.get(commandName!)!;
    if (!command) return;

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments ;(`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.reply(reply);
    }

    // set up & check cooldown

    if (!cooldowns.has(command.name)) {
        //NOTE: Please fix this part
        cooldowns.set(command.name, new Map<string, number>());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);

    if (timestamps!.has(message.author.id)) {
        const record = timestamps!.get(message.author.id);
        const expirationTime = record! + command.cooldown;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000 / 60;
            return message.reply(
                `please wait min(${timeLeft.toFixed(1)} more minutes(s), 100 dusty block times) before reusing the \`${
                    command.name
                }\` command.`,
            );
        }
    }
    // by now, we know that the command must be executed, so we want to instantiate the polkadot.js api
    const api = await polkadotApi();

    try {
        command.execute(client, message, args, api);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
};
