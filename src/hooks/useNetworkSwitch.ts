'use client';

import { useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { getCurrentNetworkConfig } from '@/config/networks';

export const useNetworkSwitch = () => {
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const currentNetworkConfig = getCurrentNetworkConfig();
  const targetChainId = currentNetworkConfig.chainId;
  
  const isCorrectNetwork = chainId === targetChainId;
  
  const switchToCorrectNetwork = useCallback(async () => {
    try {
      if (!isCorrectNetwork) {
        console.log(`🔄 切换到正确的网络: ${currentNetworkConfig.name} (Chain ID: ${targetChainId})`);
        await switchChain({ chainId: targetChainId });
      }
    } catch (error) {
      console.error('❌ 网络切换失败:', error);
      throw error;
    }
  }, [isCorrectNetwork, switchChain, targetChainId, currentNetworkConfig.name]);
  
  return {
    currentChainId: chainId,
    targetChainId,
    isCorrectNetwork,
    switchToCorrectNetwork,
    networkName: currentNetworkConfig.name,
    networkConfig: currentNetworkConfig,
  };
}; 