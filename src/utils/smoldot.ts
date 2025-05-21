import { Chain, Client } from 'dedot/smoldot';
import { startWithWorker } from 'dedot/smoldot/with-worker';
import SmoldotWorker from 'dedot/smoldot/worker?worker';

export const newSmoldotChain = async (chainSpec: string): Promise<Chain> => {
  const client: Client = startWithWorker(new SmoldotWorker());

  // TODO terminate on disconnect
  return client.addChain({ chainSpec });
};
