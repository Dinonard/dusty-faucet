import { ApiPromise } from '@polkadot/api';
import { Client, Message } from 'discord.js';

export type Command = {
    name: string;
    args: number;
    usage: string;
    cooldown: number;
    execute: (client: Client, message: Message, args: string[], api: ApiPromise) => void;
};

export type Commands = Map<string, Command>;

export type Cooldowns = Map<string, Map<string, number>>;
