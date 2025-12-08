import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import useApi from '@/hooks/useApi';
import { JsonRpcApi, NetworkInfo, Props } from '@/types';
import { SUPPORTED_NETWORKS } from '@/utils/networks';
import { DedotClient, LegacyClient } from 'dedot';
import { useWalletContext } from "@/providers/WalletProvider.tsx";

interface ApiContextProps {
  jsonRpc: JsonRpcApi;
  client?: DedotClient;
  ready: boolean;
  network: NetworkInfo;
  setNetworkId: (id: string) => void;
}

const DEFAULT_NETWORK = SUPPORTED_NETWORKS['polkadot'];

export const ApiContext = createContext<ApiContextProps>({
  ready: false,
  jsonRpc: JsonRpcApi.NEW,
  network: DEFAULT_NETWORK,
  setNetworkId: () => {},
});

export const useApiContext = () => {
  return useContext(ApiContext);
};

export default function ApiProvider({ children }: Props) {
  const { injectedApi } = useWalletContext();
  const [networkId, setNetworkId] = useLocalStorage<string>('SELECTED_NETWORK_ID');
  const [network, setNetwork] = useState<NetworkInfo>();
  const { ready, client, jsonRpc } = useApi(network);

  useEffect(() => {
    if (networkId) {
      setNetwork(SUPPORTED_NETWORKS[networkId])
    } else {
      setNetwork(DEFAULT_NETWORK)
    }
  }, [networkId]);

  useEffect(() => {
    client?.setSigner(injectedApi?.signer as any);
  }, [injectedApi, client])

  return (
    <ApiContext.Provider value={{ client, jsonRpc, ready, network: network!, setNetworkId }}>
      {children}
    </ApiContext.Provider>
  );
}
