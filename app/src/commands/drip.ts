const helpers = require('../helpers');

module.exports = {
    slash: true,
    testOnly: true,
    description: 'Send current amount PLD to given address on dusty network!',
    minArgs: 1,
    expectedArgs: '<dusty address>',
    callback: ({ args }) => {
        try {
            helpers.Api.sendTokens(message, args, api);
        } catch (e) {
            console.log('Error connecting to network: {}', e);
        }
    },
};

class drip {
    constructor() {
        this.name = 'drip';
        this.args = 1;
        this.usage = '';
    }
    name = 'drip';
    args = 1;
    usage = '<dusty address>';
    execute(message: any, args: any, api: any) {}
}

export { drip };
