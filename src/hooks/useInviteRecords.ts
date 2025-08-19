"use client";

import { useReadContract } from "wagmi";
import idoABI from "@/abis/ido.json";
import { getContractAddress } from "@/config/networks";
import { useAccount } from "wagmi";
import { useState, useCallback } from "react";

const PAGE_SIZE = 20; // 每页显示数量

type InviteRecordsResult = [`0x${string}`[], bigint, boolean];

export const useInviteRecords = () => {
  const { address: userAddress, isConnected } = useAccount();
  const [currentPage, setCurrentPage] = useState(0);

  // 获取邀请记录
  const { data, refetch: refetchInvites } = useReadContract({
    address: getContractAddress(),
    abi: idoABI,
    functionName: 'getInviteRecords',
    args: [
      userAddress || '0x0000000000000000000000000000000000000000',
      BigInt(currentPage * PAGE_SIZE),
      BigInt(PAGE_SIZE),
    ],
    query: {
      enabled: isConnected && !!userAddress,
    }
  });

  console.log("data", data);
  
  // 解构返回数据
  const invitees = (data as InviteRecordsResult)?.[0] ?? [];
  const total = (data as InviteRecordsResult)?.[1] ?? BigInt(0);
  const hasMore = (data as InviteRecordsResult)?.[2] ?? false;

  // 加载更多
  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  // 重置页码
  const reset = useCallback(() => {
    setCurrentPage(0);
  }, []);

  return {
    invitees: invitees as `0x${string}`[],
    total: Number(total),
    hasMore,
    currentPage,
    loadMore,
    reset,
    refetchInvites,
  };
};
