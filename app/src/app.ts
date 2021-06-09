import { Message } from 'discord.js';
import { drip } from './commands/drip';
const Discord = require('discord.js');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const TOKEN = process.env.DISCORD_TOKEN;
const fs = require('fs');
const { prefix } = require('../config.json');
/**
 * the main entry function for running the discord application
 */
export default async function main() {
    if (!TOKEN) throw new Error('Please provide discord bot credentials');
    await discordBot(TOKEN);
}

async function discordBot(token: string) {
    // Create an instance of a Discord client app
    const client = new Discord.Client({ fetchAllMembers: true, disableMentions: 'all' });
    client.commands = new Discord.Collection();
    client.cooldowns = new Discord.Collection();

    const commandFolder = await fs.readdirSync('src/commands');
    console.log(commandFolder);

    /**
     * The ready event is vital, it means that only _after_ this will your bot start reacting to information
     * received from Discord
     */
    client.once('ready', () => {
        console.log(`Plasm faucet has started`);
    });
    console.log(prefix);

    client.on('message', (message: Message) => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        if (!args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            reply += `\nThe proper usage would be: \`${prefix}${commandName} <address> \``;

            return message.channel.send(reply);
        }

        const { cooldowns } = client;

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }
        console.log('made it');

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
            console.log('land ho!');
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command!');
        }
    });

    // Log our bot in using the token from https://discord.com/developers/applications
    await client.login(token);
}
