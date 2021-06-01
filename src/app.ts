import Discord, { Message } from 'discord.js';

const TOKEN = process.env.DISCORD_TOKEN;
const WEBHOOK_CRED = { id: process.env.WEBHOOK_ID, token: process.env.WEBHOOK_TOKEN };

/**
 * the main entry function for running the discord application
 */
export default async function main() {
    // if (!TOKEN) throw new Error('Please provide discord bot credentials');
    // await discordBot(TOKEN);

    if (!WEBHOOK_CRED.id || !WEBHOOK_CRED.token) throw new Error('Please provide discord channel webhook credentials');
    await webhookIntegration(WEBHOOK_CRED.id, WEBHOOK_CRED.token);
}

async function discordBot(token: string) {
    // Create an instance of a Discord client app
    const client = new Discord.Client({ fetchAllMembers: true, disableMentions: 'all' });

    /**
     * The ready event is vital, it means that only _after_ this will your bot start reacting to information
     * received from Discord
     */
    client.on('ready', async () => {
        const applicationInfo = await client.fetchApplication();

        console.log(`${applicationInfo.name} has started`);
    });

    client.on('message', async (message: Message) => {
        const conextChannel = message.channel;

        if (message.content.startsWith('ping')) {
            conextChannel.send('pong');
            //message.author.send('pong');
        }
    });

    // Log our bot in using the token from https://discord.com/developers/applications
    await client.login(token);
}

async function webhookIntegration(channelId: string, webhookToken: string) {
    // Create a discord channel webhook client
    const webhookClient = new Discord.WebhookClient(channelId, webhookToken);

    console.log('Discord webhook client is ready!');

    webhookClient.send('Discord webhook client is ready!');
}
