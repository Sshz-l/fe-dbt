import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { cookieStorage, createStorage } from "wagmi";
import type { Storage } from "wagmi";
import { bsc, bscTestnet } from "@reown/appkit/networks";

export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "433db1b8f23d6c2f982fed207fa72963";
if (!projectId) throw new Error("Project ID is not defined");

export const networks = [bsc, bscTestnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }) as unknown as Storage,
  ssr: true,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
