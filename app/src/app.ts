/**
 * the main entry function for running the discord application
 */
export default async function main() {
    require('dotenv').config();
    if (!TOKEN) throw new Error('Please provide discord bot credentials');
    await discordBot(TOKEN);
}

import type { RegistryTypes } from '@polkadot/types/types';
const typeDefs = require('@plasm/types');
import { WsProvider, ApiPromise } from '@polkadot/api';
// set up polkadot api
async function polkadotApi() {
    const provider = new WsProvider('wss://rpc.dusty.plasmnet.io/');
    // const provider = await new WsProvider('ws://127.0.0.1:9944');
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
import { drip } from './commands/drip.js';

const Discord = require('discord.js');
const TOKEN = process.env.DISCORD_TOKEN;
const { prefix } = require('../config.json');

async function discordBot(token: string) {
    // Create an instance of a Discord client app
    const client = new Discord.Client({ fetchAllMembers: true, disableMentions: 'all' });

    client.commands = new Discord.Collection();
    client.cooldowns = new Discord.Collection();

    // previously set from folder access but failed with commonjs
    const command: drip = new drip();
    client.commands.set(command.name, command);

    client.on('ready', async () => {
        const applicationInfo = await client.fetchApplication();

        console.log(`${applicationInfo.name} has started`);
    });

    client.on(
        'message',
        async (message: {
            channel: { isText: any; name: any; id: string };
            content: string;
            author: { bot: any; id: any };
            reply: (arg0: string) => void;
        }) => {
            if (!message.channel.isText) return;
            if (message.channel.name !== 'faucet') return;
            if (!message.content.startsWith(prefix) || message.author.bot) return;
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift()?.toLowerCase();

            //error checking

            const command = client.commands.get(commandName);
            if (!command) return;

            if (command.args && !args.length) {
                let reply = `You didn't provide any arguments ;(`;

                if (command.usage) {
                    reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
                }

                return message.reply(reply);
            }

            // set up & check cooldown

            const { cooldowns } = client;
            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Discord.Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.name);

            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + command.cooldown;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000 / 60;
                    return message.reply(
                        `please wait min(${timeLeft.toFixed(
                            1,
                        )} more minutes(s), 100 dusty block times) before reusing the \`${command.name}\` command.`,
                    );
                }
            }
            // by now, we know that the command must be executed, so we want to instantiate the polkadot.js api
            const api = await polkadotApi();

            try {
                command.execute(client, args, message, api);
            } catch (error) {
                console.error(error);
                message.reply('there was an error trying to execute that command!');
            }
        },
    );

    // Log our bot in using the token from https://discord.com/developers/applications
    await client.login(token);
}
