'use client';
// export const runtime = "edge";

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, projectId, networks } from '@/connectors';

const queryClient = new QueryClient();

const appKitModal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId || '433db1b8f23d6c2f982fed207fa72963',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  networks: networks as any,
  features: { 
    email: false, 
    socials: [] 
  },
  themeMode: 'light',
  // Note: AppKit branding cannot be hidden via config
  // The "UX by" text will still appear at the bottom
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export { appKitModal };
