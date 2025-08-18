"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { ethers } from "ethers";

// 导入ABI文件和网络配置
import idoAbi from "@/abis/ido.json";
import { getContractAddress, getNetworkName, getCurrentNetworkEnv } from "@/config/networks";

// 白名单等级类型
export interface WhitelistInfo {
  level: number;
  isWhitelisted: boolean;
}

// 根据 getIDOInfo 的 outputs 定义数据类型
export interface IDOInfo {
  price: bigint; // IDO价格
  sDBTPerShare: bigint; // 每股sDBT数量
  usdtToken: `0x${string}`; // USDT代币地址
  sDBTToken: `0x${string}`; // sDBT代币地址
  sbtToken: `0x${string}`; // SBT代币地址
  treasury: `0x${string}`; // 金库地址
  status: number; // IDO状态
  totalShares: bigint; // 总股份数
  beginTime: bigint; // 开始时间
  endTime: bigint; // 结束时间
}

// 解析后的IDO信息（便于前端使用）
export interface ParsedIDOInfo {
  price: string; // 格式化的价格
  sDBTPerShare: string; // 格式化的每股sDBT数量
  usdtToken: string; // USDT代币地址
  sDBTToken: string; // sDBT代币地址
  sbtToken: string; // SBT代币地址
  treasury: string; // 金库地址
  status: number; // IDO状态
  totalShares: string; // 格式化的总股份数
  beginTime: Date; // 开始时间
  endTime: Date; // 结束时间
  isActive: boolean; // 是否进行中
  timeLeft: {
    // 剩余时间
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

// 格式化 bigint 为可读字符串
const formatBigInt = (value: bigint, decimals: number = 18): string => {
  try {
    return ethers.formatUnits(value, decimals);
  } catch (error) {
    return value.toString();
  }
};

// 计算剩余时间
const calculateTimeLeft = (
  endTime: bigint
): { days: number; hours: number; minutes: number; seconds: number } => {
  const now = Math.floor(Date.now() / 1000);
  const end = Number(endTime);
  const diff = Math.max(0, end - now);

  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  const seconds = diff % 60;

  return { days, hours, minutes, seconds };
};

// 解析IDO信息
const parseIDOInfo = (idoInfo: IDOInfo): ParsedIDOInfo => {
  const now = Math.floor(Date.now() / 1000);
  const beginTime = new Date(Number(idoInfo.beginTime) * 1000);
  const endTime = new Date(Number(idoInfo.endTime) * 1000);
  const isActive =
    now >= Number(idoInfo.beginTime) && now <= Number(idoInfo.endTime);

  return {
    price: formatBigInt(idoInfo.price, 18), // USDT通常有6位小数，但这里按18位处理
    sDBTPerShare: formatBigInt(idoInfo.sDBTPerShare),
    usdtToken: idoInfo.usdtToken,
    sDBTToken: idoInfo.sDBTToken,
    sbtToken: idoInfo.sbtToken,
    treasury: idoInfo.treasury,
    status: idoInfo.status,
    totalShares: formatBigInt(idoInfo.totalShares),
    beginTime,
    endTime,
    isActive,
    timeLeft: calculateTimeLeft(idoInfo.endTime),
  };
};

// 获取IDO信息的Hook
export const useIDOInfo = (enabled: boolean = true) => {
  console.log("=== useIDOInfo Hook 开始 ===");
  console.log("传入的 enabled 参数:", enabled);
  
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  
  console.log("publicClient 存在:", !!publicClient);
  console.log("address:", address);
  console.log("isConnected:", isConnected);
  
  // 计算最终的 enabled 状态
  const finalEnabled = enabled && !!publicClient && isConnected;
  console.log("最终的 enabled 状态:", finalEnabled);
  console.log("=== useIDOInfo Hook 结束 ===");

  const queryResult = useQuery<ParsedIDOInfo>({
    queryKey: ["idoInfo", address, isConnected],
    queryFn: async () => {
      console.log("=== queryFn 开始执行 ===");
      console.log("queryFn111");
      
      if (!publicClient) {
        console.log("❌ Public client 不可用");
        throw new Error("Public client not available");
      }

      const contractAddress = getContractAddress() as `0x${string}`;
      console.log("contractAddress111", contractAddress);
      console.log("当前网络环境:", getCurrentNetworkEnv());
      console.log("当前网络名称:", getNetworkName());

      try {
        const result = (await publicClient.readContract({
          address: contractAddress,
          abi: idoAbi,
          functionName: "getIDOInfo",
          args: [],
        })) as unknown[];

        console.log("合约调用结果:", result);

        // 将结果转换为IDOInfo类型
        const idoInfo: IDOInfo = {
          price: result[0] as bigint,
          sDBTPerShare: result[1] as bigint,
          usdtToken: result[2] as `0x${string}`,
          sDBTToken: result[3] as `0x${string}`,
          sbtToken: result[4] as `0x${string}`,
          treasury: result[5] as `0x${string}`,
          status: result[6] as number,
          totalShares: result[7] as bigint,
          beginTime: result[8] as bigint,
          endTime: result[9] as bigint,
        };

        console.log("解析后的 IDO 信息:", idoInfo);
        const parsedInfo = parseIDOInfo(idoInfo);
        console.log("最终解析结果:", parsedInfo);
        
        return parsedInfo;
      } catch (error) {
        console.log("❌ 合约调用失败:", error);
        throw error;
      }
    },
    enabled: finalEnabled,
    staleTime: 10000, // 10秒
    gcTime: 300000, // 5分钟
    refetchInterval: 30000, // 30秒轮询，用于更新倒计时
  });

  console.log("React Query 状态:", {
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    isSuccess: queryResult.isSuccess,
    error: queryResult.error,
    data: queryResult.data
  });

  return queryResult;
};

// 获取白名单等级的Hook
export const useWhitelistLevel = (enabled: boolean = true) => {
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();

  // 计算最终的 enabled 状态
  const finalEnabled = enabled && !!publicClient && isConnected && !!address;

  return useQuery<WhitelistInfo>({
    queryKey: ["whitelistLevel", address],
    queryFn: async () => {
      if (!publicClient || !address) {
        throw new Error("Public client or address not available");
      }

      const contractAddress = getContractAddress() as `0x${string}`;
      console.log("查询白名单等级 - 地址:", address);

      try {
        const level = (await publicClient.readContract({
          address: contractAddress,
          abi: idoAbi,
          functionName: "getWhitelistLevel",
          args: [address],
        })) as number;

        console.log("白名单等级:", level);

        return {
          level,
          isWhitelisted: level > 0
        };
      } catch (error) {
        console.error("查询白名单等级失败:", error);
        throw error;
      }
    },
    enabled: finalEnabled,
    staleTime: 30000, // 30秒缓存
    gcTime: 300000, // 5分钟
  });
};
