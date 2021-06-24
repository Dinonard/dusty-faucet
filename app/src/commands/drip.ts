import { ApiPromise } from '@polkadot/api';
import type { Client, Message } from 'discord.js';

import * as helpers from '../helpers';

class drip {
    // constructor duplicate needed to successfully transpile to commonjs
    constructor() {
        this.name = 'drip';
        this.args = 1;
        this.usage = '<dusty address>';
        this.cooldown = parseInt(process.env.DRIP_COOLDOWN!) * 1000; // in seconds 60 * 60 * 24
    }
    name = 'drip';
    args = 1;
    usage = '<dusty address>';
    cooldown = parseInt(process.env.DRIP_COOLDOWN!);
    execute(client: Client, message: Message, args: string[], api: ApiPromise) {
        // Deal with command
        helpers.Api.sendTokens(client, args, message, api);
    }
}

export { drip };
