const helpers = require('../helpers');

class drip {
    name: 'drip';
    args: 1;
    usage: '<dusty address>';
    execute(message: any, args: any) {
        try {
            helpers.Api.sendTokens(message, args);
        } catch (e) {
            console.log('Error connecting to network: {}', e);
        }
    }
}

export { drip };
