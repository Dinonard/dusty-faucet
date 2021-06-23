import { ApiPromise } from '@polkadot/api';
import Discord from 'discord.js';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<
            unknown,
            {
                name: string;
                args: number;
                usage: string;
                cooldown: number;
                execute: (client: Client, message: Message, args: string[], api: ApiPromise) => void;
            }
        >;
        (
            entries?:
                | readonly (readonly [
                      unknown,
                      {
                          name: string;
                          args: number;
                          usage: string;
                          cooldown: number;
                      },
                  ])[]
                | null
                | undefined,
        ): Discord.Collection<
            unknown,
            {
                name: string;
                args: number;
                usage: string;
                cooldown: number;
            }
        >;
        cooldowns: Collection<string, Discord.Collection<string, number>>;
    }
}
