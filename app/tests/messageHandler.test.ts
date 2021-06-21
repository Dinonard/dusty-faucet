const handler = require('../src/helpers').handler;
import { jest } from '@jest/globals';

describe('Message Handler', () => {
    const message = {
        channel: {
            isText: true,
            name: 'faucet',
            send: jest.fn(),
        },
        content: '/drip',
        author: {
            bot: false,
            id: 'alice',
        },
        reply: () => {},
    };

    it('no arg should error', async () => {
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith(`You didn't provide any arguments ;(`);
    });

    it('wrong address should error and not lock out', async () => {
        message.content = '/drip arstarst';
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
    });
});
