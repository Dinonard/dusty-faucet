import { ApiPromise, WsProvider } from '@polkadot/api';
import type { RegistryTypes } from '@polkadot/types/types';
import typeDefs from '@plasm/types';
// ...
export const connectApi = async (endpoint: string) => {
  const provider = new WsProvider(endpoint);
  const types = typeDefs.dustyDefinitions;
  const api = new ApiPromise({
    provider,
    types: {
      ...(types as RegistryTypes),
    },
  });
  api
}