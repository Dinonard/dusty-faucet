"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const handler = require('../src/helpers').handler;
const globals_1 = require("@jest/globals");
describe('Message Handler', () => {
    const message = {
        channel: {
            isText: true,
            name: 'faucet',
            send: globals_1.jest.fn(),
        },
        content: '/drip',
        author: {
            bot: false,
            id: 'alice',
        },
        reply: () => { },
    };
    it('no arg should error', () => __awaiter(void 0, void 0, void 0, function* () {
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith(`You didn't provide any arguments ;(`);
    }));
    it('wrong address should error and not lock out', () => __awaiter(void 0, void 0, void 0, function* () {
        message.content = '/drip arstarst';
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
    }));
    it('correct address should work and lock out', () => __awaiter(void 0, void 0, void 0, function* () {
        message.content = '/drip WgKYi43xq3AM3R9giF826vk9YG8eT48aUd6SGWnUqb1c4yX';
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith('invalid usage. Please check your address!');
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('please wait min('));
        handler.messageHandler(message);
        expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('please wait min('));
    }));
});
//# sourceMappingURL=messageHandler.test.js.map