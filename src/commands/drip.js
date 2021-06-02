const helpers = require('../helpers');

module.exports = {
    name: 'drip',
    args: 1,
    usage: '<polkadot address>',
    execute(message, args) {
        try {
            const api = await helpers.Api.connectApi(args[0]);
            
        } catch (e) {
            console.log('Error connecting to network: {}', e)
        }
    },
};
