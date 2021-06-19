const helpers = require('../helpers');

class drip {
    // constructor duplicate needed to successfully transpile to commonjs
    constructor() {
        this.name = 'drip';
        this.args = 1;
        this.usage = '<dusty address>';
        this.cooldown = parseInt(process.env.DRIP_COOLDOWN!); // in seconds 60 * 60 * 24
    }
    name = 'drip';
    args = 1;
    usage = '<dusty address>';
    cooldown = parseInt(process.env.DRIP_COOLDOWN!);
    execute(message: any, args: any, api: any) {
        // Deal with command
        helpers.Api.sendTokens(message, args, api);
    }
}

export { drip };
