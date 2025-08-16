import Wallet, { WalletOptions } from '@/wallets/Wallet';
import { DedotSignerSdk } from '@dedot/signer-sdk';

interface WebsiteWalletOptions extends WalletOptions {
  walletUrl: string;
}

export default class WebsiteWallet extends Wallet<WebsiteWalletOptions> {
  #sdk?: DedotSignerSdk;
  constructor(options: WebsiteWalletOptions) {
    super(options);
  }

  get walletUrl() {
    return this.options.walletUrl;
  }

  async initialize() {
    if (this.#sdk?.isInitializedWithUrl(this.walletUrl)) {
      return;
    }

    if (this.#sdk) {
      await this.#sdk.destroy();
    }

    this.#sdk = new DedotSignerSdk({ walletUrl: this.walletUrl });
    await this.#sdk.initialize();

    if (this.id !== this.#sdk.walletInfo?.name) {
      this.#sdk.destroy();
      throw new Error('Wallet ID does not match!');
    }
  }

  get ready() {
    return !!this.#sdk?.initialized && super.ready;
  }

  get installed() {
    return true;
  }

  get sdk() {
    return this.#sdk;
  }
}
