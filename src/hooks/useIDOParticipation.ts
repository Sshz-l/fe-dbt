'use client';

import { useCallback, useState } from 'react';
import { useWriteContract, useWatchContractEvent } from 'wagmi';
import idoABI from '@/abis/ido.json';
import { getContractAddress } from "@/config/networks";
import { parseUnits } from 'viem';

const IDO_AMOUNT = '330'; // USDT amount for IDO

export const useIDOParticipation = () => {
  const [isParticipating, setIsParticipating] = useState(false);
  const [participationError, setParticipationError] = useState<string | null>(null);

  // 参与 IDO
  const { writeContract } = useWriteContract();

  // 监听交易状态
  useWatchContractEvent({
    address: getContractAddress(),
    abi: idoABI,
    eventName: 'IDOParticipation',
    onLogs: () => {
      setIsParticipating(false);
    },
    onError: (error) => {
      setParticipationError(error?.message || '参与失败');
      setIsParticipating(false);
    },
  });

  // 执行参与
  const handleParticipate = useCallback(async (referrer: string) => {
    try {
      setIsParticipating(true);
      setParticipationError(null);
      await writeContract({
        address: getContractAddress(),
        abi: idoABI,
        functionName: 'participateInIDO',
        args: [parseUnits(IDO_AMOUNT, 6), referrer],
      });
    } catch (error) {
      setParticipationError(error instanceof Error ? error.message : '参与失败');
      setIsParticipating(false);
    }
  }, [writeContract]);

  return {
    isParticipating,
    participationError,
    handleParticipate,
  };
}; 