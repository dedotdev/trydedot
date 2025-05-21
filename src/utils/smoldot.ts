import { startWithWorker } from 'dedot/smoldot/with-worker';
import SmoldotWorker from 'dedot/smoldot/worker?worker';
import type { Chain } from 'smoldot/no-auto-bytecode';

export const newSmoldotChain = async (chainSpec: string): Promise<Chain> => {
  const client = startWithWorker(new SmoldotWorker());

  return client.addChain({ chainSpec });
};
