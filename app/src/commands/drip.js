const helpers = require('../helpers');

module.exports = {
    name: 'drip',
    args: 1,
    usage: '<network address> <network>',
    execute(message, args) {
        try {
            helpers.Api.sendTokens(args);
        } catch (e) {
            console.log('Error connecting to network: {}', e);
        }
    },
};
