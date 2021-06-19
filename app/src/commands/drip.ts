const helpers = require('../helpers');

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
    execute(client: any, message: any, args: any, api: any) {
        // Deal with command
        if (helpers.Api.sendTokens(client, message, args, api) === 'ok') {
        }
    }
}

export { drip };
