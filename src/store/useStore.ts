import { create } from 'zustand';

interface WalletState {
  account: string | null;
  balance: string;
  setAccount: (account: string | null) => void;
  setBalance: (balance: string) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  account: null,
  balance: '0',
  setAccount: (account) => set({ account }),
  setBalance: (balance) => set({ balance }),
}));