const helpers = require('../helpers');

module.exports = {
    name: 'drip',
    args: 1,
    usage: '<dusty address>',
    execute(message, args) {
        try {
            helpers.Api.sendTokens(message, args);
        } catch (e) {
            console.log('Error connecting to network: {}', e);
        }
    },
};
