"use client";

import { useCallback, useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import { type Hash } from 'viem';
import idoABI from "@/abis/ido.json";
import { getContractAddress } from "@/config/networks";
import { useToast } from "@chakra-ui/react";
import { useI18n } from "@/i18n/context";

export const useIDOParticipation = () => {
  const { t } = useI18n();
  const toast = useToast();
  const { address: userAddress } = useAccount();
  const [isParticipating, setIsParticipating] = useState(false);
  const [participationError, setParticipationError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | undefined>();
  const [pendingToastId, setPendingToastId] = useState<string | number | undefined>();

  // 检查用户是否已参与
  const { data: participationTime, refetch: refetchParticipation } = useReadContract({
    address: getContractAddress(),
    abi: idoABI,
    functionName: "hasParticipated",
    args: [userAddress || "0x0000000000000000000000000000000000000000"],
  });

  const hasParticipated = participationTime ? BigInt(participationTime.toString()) > BigInt(0) : false;

  // 参与 IDO
  const { writeContractAsync } = useWriteContract();
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
      // toast({
      //   title: t('common.participationSuccess'),
      //   description: `${t("common.subscriptionSuccessDesc")}\n${t("common.viewOnExplorer")}: https://testnet.bscscan.com/tx/${txHash}`,
      //   status: 'success',
      //   duration: 5000,
      //   isClosable: true,
      // });
      // 刷新认购状态
      refetchParticipation();
      // 重置状态
      setTxHash(undefined);
    }
  }, [receipt, pendingToastId, txHash, toast, t, refetchParticipation]);

  // 执行参与
  const handleParticipate = useCallback(async (referrer: string): Promise<Hash | null> => {
    if (!userAddress) return null;

    try {
      setIsParticipating(true);
      setParticipationError(null);

      const hash = await writeContractAsync({
        address: getContractAddress(),
        abi: idoABI,
        functionName: "participateInIDO",
        args: [referrer],
      });

      setTxHash(hash);
      
      // 显示等待提示
      const toastId = toast({
        title: t('common.participationPending'),
        description: t('common.pleaseWait'),
        status: 'info',
        duration: null,
        isClosable: false,
      });
      setPendingToastId(toastId);

      return hash;
    } catch (error) {
      console.error('参与失败:', error);
      setParticipationError(error instanceof Error ? error.message : t('common.participationFailed'));
      toast({
        title: t('common.participationFailed'),
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 5000,
      });
      return null;
    } finally {
      setIsParticipating(false);
    }
  }, [userAddress, writeContractAsync, t, toast]);

  return {
    isParticipating: isParticipating || isWaiting,
    participationError,
    handleParticipate,
    hasParticipated,
    participationTime: participationTime ? Number(participationTime.toString()) : 0,
    refetchParticipation,
  };
};
