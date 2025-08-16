import { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { useAsync, useLocalStorage } from 'react-use';
import useWallets from '@/hooks/useWallets';
import { InjectedAccount } from '@/types';
import { Props } from '@/types';
import Wallet from '@/wallets/Wallet';
import WebsiteWallet from '@/wallets/WebsiteWallet.ts';
import { UpdatableInjected } from '@dedot/signer-sdk/types';
import { waitFor } from 'dedot/utils';


interface WalletContextProps {
  accounts: InjectedAccount[];
  injectedApi?: UpdatableInjected;
  enableWallet: (id: string) => void;
  signOut: () => void;
  availableWallets: Wallet[];
  connectedWalletId?: string;
  connectedWallet?: Wallet;
}

export const WalletContext = createContext<WalletContextProps>({
  accounts: [],
  enableWallet: () => {},
  signOut: () => {},
  availableWallets: [],
});

export const useWalletContext = () => {
  return useContext(WalletContext);
};

export default function WalletProvider({ children }: Props) {
  const availableWallets = useWallets();
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [injectedApi, setInjectedApi] = useState<UpdatableInjected>();
  const [connectedWalletId, setConnectedWalletId, removeConnectedWalletId] =
    useLocalStorage<string>('CONNECTED_WALLET');
  const [connectedWallet, setConnectedWallet] = useState<Wallet>();

  const getWallet = (id: string): Wallet => {
    const targetWallet: Wallet = availableWallets.find((one) => one.id === id)!;
    if (!targetWallet) {
      throw new Error('Invalid Wallet ID');
    }

    return targetWallet;
  };

  useAsync(async () => {
    if (!connectedWalletId) {
      setConnectedWallet(undefined);
      return;
    }

    let unsub: () => void;
    try {
      const targetWallet: Wallet = getWallet(connectedWalletId);
      setConnectedWallet(targetWallet);

      await targetWallet.waitUntilReady();

      const injectedProvider = targetWallet.injectedProvider;
      if (!injectedProvider?.enable) {
        throw new Error('Wallet is not existed!');
      }

      console.log('calling enable')
      const injectedApi = await injectedProvider.enable('Sample Dapp');
      console.log('injectedApi', injectedApi)

      unsub = injectedApi.accounts.subscribe(setAccounts);

      setInjectedApi(injectedApi);
    } catch (e: any) {
      toast.error(e.message);
      setConnectedWallet(undefined);
      removeConnectedWalletId();
    }

    return () => unsub && unsub();
  }, [connectedWalletId]);

  const enableWallet = async (walletId: string) => {
    const targetWallet: Wallet = getWallet(walletId);

    try {
      if (targetWallet instanceof WebsiteWallet) {
        await targetWallet.waitUntilReady();
        await targetWallet.sdk!.newWaitingWalletInstance()

        console.log('wait for 2s')
        await waitFor(2_000)
        console.log('start connecting wallets')
      }
    } catch (error: any) {
      window.alert(`An error occurred: ${error.message}`);
    }

    setConnectedWalletId(walletId);
  };

  const signOut = () => {
    if (connectedWallet) {
      const walletApi = connectedWallet.injectedProvider;

      if (walletApi?.disable) {
        walletApi.disable();
      }
    }

    removeConnectedWalletId();
    setInjectedApi(undefined);
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        enableWallet,
        injectedApi,
        signOut,
        availableWallets,
        connectedWalletId,
        connectedWallet,
      }}>
      {children}
    </WalletContext.Provider>
  );
}
