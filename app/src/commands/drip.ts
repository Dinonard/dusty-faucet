const helpers = require('../helpers');

class drip {
    public name: 'drip';
    public args: 1;
    public usage: '<dusty address>';
    public execute(message: any, args: any) {
        try {
            helpers.Api.sendTokens(message, args);
        } catch (e) {
            console.log('Error connecting to network: {}', e);
        }
    }
}

export { drip };
