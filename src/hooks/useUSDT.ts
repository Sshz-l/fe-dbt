'use client';

import { useCallback, useState } from 'react';
import { useReadContract, useWriteContract, useWatchContractEvent, useAccount, useChainId, useBalance } from 'wagmi';
import { getUSDTAddress, getContractAddress } from '@/config/networks';
import { parseUnits, type Address } from 'viem';
import usdtABI from '@/abis/usdt.json';
import { useI18n } from '@/i18n/context';

const IDO_AMOUNT = parseUnits('330', 18); // USDT amount for IDO

export const useUSDT = (spenderAddress: string) => {
  const { t } = useI18n();
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // 检查用户钱包的原生代币余额（用于支付 gas）
  const { data: nativeBalance } = useBalance({
    address: userAddress,
  });

  // 检查用户钱包的 USDT 余额
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: getUSDTAddress(),
    chainId: chainId,
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
    chainId: chainId,
    abi: usdtABI,
    functionName: 'allowance',
    args: [userAddress || '0x0000000000000000000000000000000000000000', getContractAddress()],
    query: {
      enabled: isConnected && !!userAddress && !!spenderAddress,
    }
  });

  console.log('allowance', allowance);

  // 授权 USDT
  const { writeContractAsync: writeAsync } = useWriteContract();

  // 监听授权事件
  useWatchContractEvent({
    address: getUSDTAddress(),
    abi: usdtABI,
    eventName: 'Approval',
    onLogs: () => {
      // 立即重新获取授权额度
      refetchAllowance();
      setIsApproving(false);
    },
    onError: (error) => {
      setApproveError(error?.message || t("common.approveFailed"));
      setIsApproving(false);
    },
  });

  // 执行授权
  const handleApprove = useCallback(async () => {
    if (!userAddress || !spenderAddress) return;

    // 检查 gas 余额
    if (!nativeBalance || nativeBalance.value < parseUnits('0.01', 18)) {
      setApproveError(t("common.gasBalanceNotEnough"));
      return;
    }

    try {
      setIsApproving(true);
      setApproveError(null);
      const tx = await writeAsync({
        address: getUSDTAddress() as Address,
        chainId: chainId,
        abi: usdtABI,
        functionName: 'approve',
        args: [getContractAddress() as Address, IDO_AMOUNT],
      });
      
      // 交易发送成功后立即重新获取授权额度
      await refetchAllowance();
      
      return tx;
    } catch (error) {
      console.log('授权错误:', error);
      setApproveError(error instanceof Error ? error.message : t("common.approveFailed"));
      setIsApproving(false);
    }
  }, [userAddress, spenderAddress, nativeBalance, writeAsync, chainId, refetchAllowance, t]);

  // 获取 USDT 状态
  const getUSDTStatus = useCallback(() => {
    // 检查钱包是否连接
    if (!isConnected || !userAddress) {
      return {
        isValid: false,
        message: t("common.pleaseConnectWallet"),
        buttonDisabled: true,
        needsApproval: false,
      };
    }

    // 检查 gas 余额
    if (nativeBalance && nativeBalance.value < parseUnits('0.01', 18)) {
      return {
        isValid: false,
        message: t("common.gasBalanceNotEnough"),
        buttonDisabled: true,
        needsApproval: false,
      };
    }

    // 检查余额
    if (balance === undefined) {
      return {
        isValid: false,
        message: t("common.checkingBalance"),
        buttonDisabled: true,
        needsApproval: false,
      };
    }

    const balanceInUSDT = Number(balance) / 1e18;
    if (balanceInUSDT < Number(IDO_AMOUNT) / 1e18) {
      return {
        isValid: false,
        message: t("common.usdtBalanceNotEnough"),
        buttonDisabled: true,
        needsApproval: false,
      };
    }

    // 余额充足，检查授权额度
    if (allowance === undefined) {
      return {
        isValid: false,
        message: t("common.checkingAuthorization"),
        buttonDisabled: true,
        needsApproval: false,
      };
    }

    const allowanceInUSDT = Number(allowance) / 1e18;
    if (allowanceInUSDT < Number(IDO_AMOUNT) / 1e18) {
      return {
        isValid: false,
        message: t("common.approveUSDT"),
        buttonDisabled: false,
        needsApproval: true,
      };
    }

    // 余额充足且已授权
    return {
      isValid: true,
      message: t("common.bindAndParticipate"),
      buttonDisabled: false,
      needsApproval: false,
    };
  }, [isConnected, userAddress, nativeBalance, balance, allowance, t]);

  return {
    balance,
    allowance,
    isApproving,
    approveError,
    handleApprove,
    getUSDTStatus,
    refetchBalance,
    refetchAllowance,
  };
}; 