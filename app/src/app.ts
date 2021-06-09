import { Message } from 'discord.js';
import { drip } from './commands/drip';
const Discord = require('discord.js');

//change to process.env.TOKEN or get from set up so we can make code public
const TOKEN = process.env.DISCORD_TOKEN;
const fs = require('fs');
const { prefix } = require('../config.json');
/**
 * the main entry function for running the discord application
 */
export default async function main() {
    require('dotenv').config();
    if (!TOKEN) throw new Error('Please provide discord bot credentials');
    await discordBot(TOKEN);
}

async function discordBot(token: string) {
    // Create an instance of a Discord client app
    const client = new Discord.Client({ fetchAllMembers: true, disableMentions: 'all' });
    client.commands = new Discord.Collection();
    client.cooldowns = new Discord.Collection();

    const command: drip = new drip();
    client.commands.set(command.name, command);

    /**
     * The ready event is vital, it means that only _after_ this will your bot start reacting to information
     * received from Discord
     */
    client.on('ready', async () => {
        const applicationInfo = await client.fetchApplication();

        console.log(`${applicationInfo.name} has started`);
    });

    client.on('message', (message: Message) => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments ;(`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.reply(reply);
        }

        const { cooldowns } = client;

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(
                    `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
                );
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        try {
            command.execute(args, message);
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command!');
        }
    });

    // Log our bot in using the token from https://discord.com/developers/applications
    await client.login(token);
}
