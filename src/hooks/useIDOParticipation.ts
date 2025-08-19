"use client";

import { useCallback, useState } from "react";
import {
  useWriteContract,
  useWatchContractEvent,
  useReadContract,
  useAccount,
} from "wagmi";
import idoABI from "@/abis/ido.json";
import { getContractAddress } from "@/config/networks";
import { parseUnits } from "viem";

const IDO_AMOUNT = "330"; // USDT amount for IDO

export const useIDOParticipation = () => {
  const { address: userAddress } = useAccount();
  const [isParticipating, setIsParticipating] = useState(false);
  const [participationError, setParticipationError] = useState<string | null>(
    null
  );

  // 检查用户是否已参与
  const { data: hasParticipated, refetch: refetchParticipation } =
    useReadContract({
      address: getContractAddress(),
      abi: idoABI,
      functionName: "hasParticipated",
      args: [userAddress || "0x0000000000000000000000000000000000000000"],
    });

  // 参与 IDO
  const { writeContractAsync: writeAsync } = useWriteContract();

  // 监听交易状态
  useWatchContractEvent({
    address: getContractAddress(),
    abi: idoABI,
    eventName: "IDOParticipation",
    onLogs: () => {
      setIsParticipating(false);
      // 更新参与状态
      refetchParticipation();
    },
    onError: (error) => {
      setParticipationError(error?.message || "参与失败");
      setIsParticipating(false);
    },
  });

  // 执行参与
  const handleParticipate = useCallback(
    async (referrer: string) => {
      if (!userAddress || hasParticipated) return;

      console.log(
        "getContractAddress::" + getContractAddress(),
        "referrer::" + referrer
      );

      // console.log("handleParticipate", userAddress, hasParticipated, referrer);

      try {
        setIsParticipating(true);
        setParticipationError(null);
        const tx = await writeAsync({
          address: getContractAddress(),
          abi: idoABI,
          functionName: "participateInIDO",
          args: [referrer],
        });

        return tx;
      } catch (error) {
        setParticipationError(
          error instanceof Error ? error.message : "参与失败"
        );
        setIsParticipating(false);
        return null;
      }
    },
    [writeAsync, userAddress, hasParticipated]
  );

  return {
    isParticipating,
    participationError,
    handleParticipate,
    hasParticipated,
    participationTime: hasParticipated ? Number(hasParticipated) : 0,
    refetchParticipation,
  };
};
