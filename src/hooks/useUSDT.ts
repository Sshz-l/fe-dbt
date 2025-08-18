'use client';

import { useCallback, useState } from 'react';
import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import approveABI from '@/abis/approve.json';
import { getUSDTAddress } from '@/config/networks';
import { parseUnits } from 'viem';

const IDO_AMOUNT = '330'; // USDT amount for IDO

export const useUSDT = (spenderAddress: string) => {
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  console.log('getUSDTAddress', getUSDTAddress());

  // 检查 USDT 余额
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: getUSDTAddress(),
    abi: approveABI,
    functionName: 'balanceOf',
    args: [spenderAddress],
  });

  // 检查授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: getUSDTAddress(),
    abi: approveABI,
    functionName: 'allowance',
    args: [spenderAddress, getUSDTAddress()],
  });

  // 授权 USDT
  const { writeContract } = useWriteContract();

  // 监听授权事件
  useWatchContractEvent({
    address: getUSDTAddress(),
    abi: approveABI,
    eventName: 'Approval',
    onLogs: () => {
      refetchAllowance();
      setIsApproving(false);
    },
    onError: (error) => {
      setApproveError(error?.message || '授权失败');
      setIsApproving(false);
    },
  });

  // 执行授权
  const handleApprove = useCallback(async () => {
    try {
      setIsApproving(true);
      setApproveError(null);
      await writeContract({
        address: getUSDTAddress(),
        abi: approveABI,
        functionName: 'approve',
        args: [spenderAddress, parseUnits(IDO_AMOUNT, 6)],
      });
    } catch (error) {
      setApproveError(error instanceof Error ? error.message : '授权失败');
      setIsApproving(false);
    }
  }, [writeContract, spenderAddress]);

  // 获取 USDT 状态
  const getUSDTStatus = useCallback(() => {
    if (!balance) {
      return {
        isValid: false,
        message: '检查余额中...',
        buttonDisabled: true,
      };
    }

    const balanceInUSDT = Number(balance) / 1e6;
    if (balanceInUSDT < Number(IDO_AMOUNT)) {
      return {
        isValid: false,
        message: 'USDT余额不足',
        buttonDisabled: true,
      };
    }

    if (!allowance) {
      return {
        isValid: false,
        message: '检查授权中...',
        buttonDisabled: true,
      };
    }

    const allowanceInUSDT = Number(allowance) / 1e6;
    if (allowanceInUSDT < Number(IDO_AMOUNT)) {
      return {
        isValid: false,
        message: '需要授权USDT',
        buttonDisabled: false,
        needsApproval: true,
      };
    }

    return {
      isValid: true,
      message: '',
      buttonDisabled: false,
      needsApproval: false,
    };
  }, [balance, allowance]);

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