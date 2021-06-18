const helpers = require('../helpers');

module.exports = {
    slash: true,
    testOnly: true,
    description: 'Send current amount PLD to given address on dusty network!',
    minArgs: 1,
    maxArgs: 1,
    SyntaxError: 'Incorrect Usage! Please use `/drip {ARGUMENTS}',
    cooldown: '3s',
    expectedArgs: '<dusty address>',
    flags: 64, //doesn't seem to do anything
    callback: async (args: any) => {
        let res: string;
        try {
            //console.log(args);
            res = await helpers.Api.sendTokens(args.args);
        } catch (e) {
            console.log('Error connecting to network: {}', e);
            res = 'There was an error with sendTokens ;(';
        }
        console.log(res);
        return res;
    },
};
