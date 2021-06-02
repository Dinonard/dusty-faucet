import { WsProvider, Keyring, ApiPromise } from "@polkadot/api";
import { cryptoWaitReady, checkAddress } from "@polkadot/util-crypto";
import { formatBalance } from "@polkadot/util";
import { Balance } from "@polkadot/types/interfaces";
import { createType } from "@polkadot/types";
import type { RegistryTypes } from '@polkadot/types/types';
import typeDefs from '@plasm/types';
// ...
export const sendTokens = async (args: Array<string>) => {
const keyring = new Keyring({ type: "sr25519" });
  const provider = new WsProvider("wss://rpc.dusty.plasmnet.io");
  let types, networkPrefix;
  // let network = args[0].toString().toLowerCase()
  // use if we want to switch between networks
    networkPrefix = 5;
    types = typeDefs.dustyDefinitions;

    
        




  
  const api = new ApiPromise({
    provider,
    types: {
      ...(types as RegistryTypes),
    },
  });


}