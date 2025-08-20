'use client';

import { useCallback, useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';
import { getUSDTAddress, getContractAddress } from '@/config/networks';
import { parseUnits, type Hash } from 'viem';
import { useI18n } from '@/i18n/context';
import { useToast } from '@chakra-ui/react';
import usdtABI from '@/abis/usdt.json';

const IDO_AMOUNT = parseUnits('330', 18); // USDT amount for IDO

export const useUSDT = (spenderAddress: string) => {
  const { t } = useI18n();
  const toast = useToast();
  const { address: userAddress, isConnected } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | undefined>();

  // 检查用户钱包的原生代币余额（用于支付 gas）
  const { data: nativeBalance } = useBalance({
    address: userAddress,
  });

  // 检查用户钱包的 USDT 余额
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: getUSDTAddress(),
    abi: usdtABI,
    functionName: 'balanceOf',
    args: [userAddress || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: isConnected && !!userAddress,
    }
  });

  // 检查授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: getUSDTAddress(),
    abi: usdtABI,
    functionName: 'allowance',
    args: [userAddress || '0x0000000000000000000000000000000000000000', getContractAddress()],
    query: {
      enabled: isConnected && !!userAddress && !!spenderAddress,
    }
  });

  // 授权 USDT
  const { writeContractAsync } = useWriteContract();
  const [pendingToastId, setPendingToastId] = useState<string | number | undefined>();
  const { data: receipt, isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // 监听交易状态
  useEffect(() => {
    if (receipt?.status === 'success') {
      // 关闭等待提示
      if (pendingToastId) {
        toast.close(pendingToastId);
      }
      // 显示成功提示
      toast({
        title: t('common.approveSuccess'),
        status: 'success',
        duration: 3000,
      });
      // 刷新授权额度
      refetchAllowance();
      // 重置状态
      setTxHash(undefined);
    }
  }, [receipt, pendingToastId, toast, t, refetchAllowance]);

  // 处理授权
  const handleApprove = useCallback(async (): Promise<Hash | null> => {
    if (!userAddress || !spenderAddress) return null;
    if (!nativeBalance || nativeBalance.value < parseUnits('0.01', 18)) {
      setApproveError(t('common.gasBalanceNotEnough'));
      return null;
    }

    try {
      setIsApproving(true);
      setApproveError(null);

      const hash = await writeContractAsync({
        address: getUSDTAddress(),
        abi: usdtABI,
        functionName: 'approve',
        args: [getContractAddress(), IDO_AMOUNT],
      });

      setTxHash(hash);
      
      // 显示等待提示
      const toastId = toast({
        title: t('common.approvePending'),
        description: t('common.pleaseWait'),
        status: 'info',
        duration: null,
        isClosable: false,
      });
      setPendingToastId(toastId);

      return hash;
    } catch (error) {
      console.error('授权错误:', error);
      setApproveError(error instanceof Error ? error.message : t('common.approveFailed'));
      toast({
        title: t('common.approveFailed'),
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 5000,
      });
      return null;
    } finally {
      setIsApproving(false);
    }
  }, [userAddress, spenderAddress, nativeBalance, writeContractAsync, t, toast]);

  // 获取 USDT 状态
  const getUSDTStatus = useCallback(() => {
    if (!userAddress) {
      return { isValid: false, needsApproval: false, message: t('common.pleaseConnectWallet'), buttonDisabled: true };
    }

    if (!nativeBalance || nativeBalance.value < parseUnits('0.01', 18)) {
      return { isValid: false, needsApproval: false, message: t('common.gasBalanceNotEnough'), buttonDisabled: true };
    }

    const balanceValue = balance ? BigInt(balance.toString()) : BigInt(0);
    if (balanceValue < IDO_AMOUNT) {
      return { isValid: false, needsApproval: false, message: t('common.usdtBalanceNotEnough'), buttonDisabled: true };
    }

    const allowanceValue = allowance ? BigInt(allowance.toString()) : BigInt(0);
    if (allowanceValue < IDO_AMOUNT) {
      return { isValid: false, needsApproval: true, message: t('common.needApprove'), buttonDisabled: false };
    }

    return { isValid: true, needsApproval: false, message: '', buttonDisabled: false };
  }, [userAddress, nativeBalance, balance, allowance, t]);

  return {
    isApproving: isApproving || isWaiting,
    approveError,
    handleApprove,
    getUSDTStatus,
    balance,
    allowance,
    refetchBalance,
    refetchAllowance,
  };
}; 