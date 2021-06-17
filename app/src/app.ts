/**
 * the main entry function for running the discord application
 */
export default async function main() {
    require('dotenv').config();
    if (!TOKEN) throw new Error('Please provide discord bot credentials');
    await discordBot(TOKEN);
}

const Discord = require('discord.js');
const TOKEN = process.env.DISCORD_TOKEN;
const WOKCommands = require('wokcommands');
require('dotenv').config();

const guildId = '847152969526804480';

async function discordBot(token: string) {
    // Create an instance of a Discord client app
    const client = new Discord.Client({ fetchAllMembers: true, disableMentions: 'all' });
    /**
     * The ready event is vital, it means that only _after_ this will your bot start reacting to information
     * received from Discord
     */

    client.on('ready', async () => {
        const applicationInfo = await client.fetchApplication();
        new WOKCommands(client, {
            commandsDir: 'commands',
            testServers: [guildId],
            showWarns: false,
            flags: 64,
        });

        console.log(`${applicationInfo.name} has started`);
    });

    // Log our bot in using the token from https://discord.com/developers/applications
    await client.login(token);
}
