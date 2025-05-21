import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import useApi from '@/hooks/useApi';
import { JsonRpcApi, NetworkInfo, Props } from '@/types';
import { SUPPORTED_NETWORKS } from '@/utils/networks';
import { DedotClient, LegacyClient } from 'dedot';
import { useWalletContext } from "@/providers/WalletProvider.tsx";

interface ApiContextProps {
  jsonRpc: JsonRpcApi;
  api?: DedotClient;
  legacy?: LegacyClient;
  apiReady: boolean;
  network: NetworkInfo;
  setNetworkId: (id: string) => void;
}

const DEFAULT_NETWORK = SUPPORTED_NETWORKS['polkadot'];

export const ApiContext = createContext<ApiContextProps>({
  apiReady: false,
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
  const { ready, api, legacy, jsonRpc } = useApi(network);

  useEffect(() => {
    if (networkId) {
      setNetwork(SUPPORTED_NETWORKS[networkId])
    } else {
      setNetwork(DEFAULT_NETWORK)
    }
  }, [networkId]);

  useEffect(() => {
    api?.setSigner(injectedApi?.signer as any);
    legacy?.setSigner(injectedApi?.signer as any);
  }, [injectedApi, api, legacy])

  return (
    <ApiContext.Provider value={{ api, legacy, jsonRpc, apiReady: ready, network: network!, setNetworkId }}>
      {children}
    </ApiContext.Provider>
  );
}
