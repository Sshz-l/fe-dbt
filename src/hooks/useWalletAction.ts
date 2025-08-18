import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useSignature } from './useSignature';

export interface UseWalletActionOptions {
  requireSignature?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useWalletAction = (options: UseWalletActionOptions = {}) => {
  const { requireSignature = true, onSuccess, onError } = options;
  const { isConnected } = useAccount();
  const { open: openConnectModal } = useAppKit();
  const { hasValidSignature, signForIDOParticipation, isLoading: isSigning } = useSignature();

  const wrapAction = useCallback(async (action: () => Promise<void> | void) => {
    try {
      // 如果未连接钱包，打开连接弹窗
      if (!isConnected) {
        openConnectModal();
        return;
      }

      // 如果需要签名且未签名，先进行签名
      if (requireSignature && !hasValidSignature && !isSigning) {
        await signForIDOParticipation();
        return;
      }

      // 执行实际操作
      await action();
      onSuccess?.();
    } catch (error) {
      console.error('操作失败:', error);
      onError?.(error);
    }
  }, [isConnected, requireSignature, hasValidSignature, isSigning, openConnectModal, signForIDOParticipation, onSuccess, onError]);

  // 检查是否可以显示需要签名的内容
  const canShowSignedContent = useCallback(() => {
    return isConnected && (!requireSignature || hasValidSignature);
  }, [isConnected, requireSignature, hasValidSignature]);

  return {
    wrapAction,
    canShowSignedContent,
    isConnected,
    hasValidSignature,
  };
}; 