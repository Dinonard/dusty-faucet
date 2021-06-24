/**
 * the main entry function for running the discord application
 */
import { config } from 'dotenv';
config();
export default async function main() {
    if (!TOKEN) throw new Error('Please provide discord bot credentials');
    await discordBot(TOKEN);
}

import { drip } from './commands/drip.js';
import { messageHandler } from './helpers/messageHandler.js';

import Discord, { Client, Message } from 'discord.js';
import { ApiPromise } from '@polkadot/api';
import { Command, Commands, Cooldowns } from './helpers/command.js';
const TOKEN = process.env.DISCORD_TOKEN;
export const client = new Discord.Client({ fetchAllMembers: true, disableMentions: 'all' });
export let commands: Commands;
export let cooldowns: Cooldowns;

async function discordBot(token: string) {
    // Create an instance of a Discord client app

    // previously set from folder access but failed with commonjs
    const command: drip = new drip();
    commands.set(command.name, command);

    client.on('ready', async () => {
        const applicationInfo = await client.fetchApplication();

        console.log(`${applicationInfo.name} has started`);
    });

    client.on('message', messageHandler);

    // Log our bot in using the token from https://discord.com/developers/applications
    await client.login(token);
}
