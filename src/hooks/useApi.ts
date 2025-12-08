import { useState } from 'react';
import { useAsync, useLocalStorage, useToggle } from 'react-use';
import { Connection, JsonRpcApi, NetworkInfo } from '@/types';
import { newSmoldotChain } from '@/utils/smoldot.ts';
import { DedotClient, JsonRpcProvider, LegacyClient, SmoldotProvider, WsProvider } from 'dedot';

type UseApi = {
  ready: boolean;
  jsonRpc: JsonRpcApi;
  client?: DedotClient;
};

export default function useApi(network?: NetworkInfo): UseApi {
  const [connectVia] = useLocalStorage<Connection>('SETTINGS/CONNECT_VIA', Connection.RPC_ENDPOINT);
  const [jsonRpc] = useLocalStorage<JsonRpcApi>('SETTINGS/JSON_RPC_API', JsonRpcApi.NEW);
  const [cacheMetadata] = useLocalStorage<boolean>('SETTINGS/CACHE_METADATA',true);

  const [ready, setReady] = useToggle(false);
  const [client, setClient] = useState<DedotClient>();

  useAsync(async () => {
    if (!network) {
      return;
    }

    if (client) {
      await client.disconnect();
    }

    setReady(false);

    let provider: JsonRpcProvider;

    if (connectVia === Connection.RPC_ENDPOINT) {
      provider = new WsProvider(network.providers);
      provider.on('connected', (endpoint) => {
        console.log('Connected Endpoint', endpoint);
      })
    } else {
      const chainSpec = (await network?.getChainSpec?.())!;
      console.log(`${network.name} chain-spec loaded`, JSON.parse(chainSpec));
      console.log(`Connecting to ${network.name} via smoldot ...`)
      const chain = await newSmoldotChain(chainSpec);
      provider = new SmoldotProvider(chain);
    }

    const rpcVersion = jsonRpc == JsonRpcApi.LEGACY ? 'legacy' : 'v2';

    setClient(await DedotClient.new({ provider, cacheMetadata, rpcVersion }));

    setReady(true);
  }, [jsonRpc, network?.providers]);

  return { ready, client, jsonRpc: jsonRpc! };
}
