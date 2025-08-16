import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'react-use';
import useWallets from '@/hooks/useWallets';
import { InjectedAccount, Props } from '@/types';
import Wallet from '@/wallets/Wallet';
import WebsiteWallet from '@/wallets/WebsiteWallet.ts';
import { UpdatableInjected } from '@dedot/signer-sdk/types';

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

  useEffect(() => {
    if (!connectedWalletId) {
      setConnectedWallet(undefined);
      return;
    }

    let unsub: () => void;

    (async () => {
      try {
        const targetWallet: Wallet = getWallet(connectedWalletId);
        setConnectedWallet(targetWallet);

        await targetWallet.waitUntilReady();

        const injectedProvider = targetWallet.injectedProvider;
        if (!injectedProvider?.enable) {
          throw new Error('Wallet is not existed!');
        }

        const injectedApi = await injectedProvider.enable('Sample Dapp');

        unsub = injectedApi.accounts.subscribe(setAccounts);

        setInjectedApi(injectedApi);
      } catch (e: any) {
        toast.error(e.message);
        setConnectedWallet(undefined);
        removeConnectedWalletId();
      }
    })();

    return () => {
      unsub && unsub();
    }
  }, [connectedWalletId]);

  const enableWallet = async (walletId: string) => {
    const targetWallet: Wallet = getWallet(walletId);

    if (connectedWallet instanceof WebsiteWallet) {
      signOut();
    }

    try {
      if (targetWallet instanceof WebsiteWallet) {
        await targetWallet.waitUntilReady();
        await targetWallet.sdk!.newWaitingWalletInstance()
      }
    } catch (error: any) {
      console.error(`An error occurred: ${error.message}`);
    }

    if (walletId === connectedWalletId) {
      setConnectedWalletId(undefined)
    }

    setTimeout(() => {
      setConnectedWalletId(walletId);
    }, 200)
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
