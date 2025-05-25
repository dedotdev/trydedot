import { Chain, Client } from 'dedot/smoldot';
import { startWithWorker } from 'dedot/smoldot/with-worker';

export const newSmoldotChain = async (chainSpec: string): Promise<Chain> => {
  const SmoldotWorker = new Worker(
    new URL('dedot/smoldot/worker', import.meta.url), // --
    { type: 'module' },
  );

  const client: Client = startWithWorker(SmoldotWorker);

  // TODO terminate on disconnect
  return client.addChain({ chainSpec });
};
