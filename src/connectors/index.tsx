import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { mainnet } from '@reown/appkit/networks';
import { bsc, bscTestnet } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) throw new Error('Project ID is not defined');

export const networks = [mainnet, bsc, bscTestnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
