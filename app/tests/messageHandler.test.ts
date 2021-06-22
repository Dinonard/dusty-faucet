import { messageHandler } from '../src/helpers/messageHandler';
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
        messageHandler(message);
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
