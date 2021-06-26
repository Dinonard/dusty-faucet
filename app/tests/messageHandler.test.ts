import { jest } from '@jest/globals';
import { Message } from 'discord.js';
import { messageHandler } from '../build/helpers/messageHandler';

describe('Message Handler', () => {
    process.env.NODE_ENV = 'TEST';
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
    } as any as Message;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('no arg should error', async () => {
        try {
            await messageHandler(message).catch((reason: Error) => {
                console.log(reason);
            });
        } catch (error) {
            console.log(error);
        }
        expect(message.reply).toHaveBeenCalledWith(`You didn't provide any arguments ;(`);
    });

    it('wrong address should error and not lock out', async () => {
        message.content = '/drip arstarst';
        messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
        messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
        messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
    });

    it('correct address should work and lock out', async () => {
        message.content = '/drip WgKYi43xq3AM3R9giF826vk9YG8eT48aUd6SGWnUqb1c4yX';
        messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
        messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('please wait min('));
        messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('please wait min('));
    });
});
