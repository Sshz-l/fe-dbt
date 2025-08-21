"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits, createPublicClient, http, fallback, Chain } from "viem";
import { bsc, bscTestnet } from '@reown/appkit/networks';
import { handleReadContractError } from '@/utils/errors';

// 导入ABI文件和网络配置
import idoAbi from "@/abis/ido.json";
import {
  getContractAddress,
  getNetworkName,
  getCurrentNetworkEnv,
  getRpcUrl,
} from "@/config/networks";

export enum WhitelistLevel {
  None = 0,
  L0 = 1, // 核心团队 (8%奖励，仅可推荐不可参与)
  L1 = 2, // 一线成员 (10%奖励)
  L2 = 3, // 团队领袖 (15%奖励)
}

// 白名单等级类型
export interface WhitelistInfo {
  level: WhitelistLevel;
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
  hasStarted: boolean; // 是否已开始
  hasEnded: boolean; // 是否已结束
  timeLeft: {
    // 剩余时间
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

// 推荐统计信息类型
export interface ReferralStats {
  referralCount: bigint;
  sbtsMinted: bigint;
  sbtsClaimable: bigint;
}

// 解析后的推荐统计信息
export interface ParsedReferralStats {
  referralCount: number;
  sbtsMinted: number;
  sbtsClaimable: number;
}

// 未领取奖励信息类型
export interface UnclaimedRewards {
  rewards: bigint;
}

// 解析后的未领取奖励信息
export interface ParsedUnclaimedRewards {
  rewards: string;
  formattedRewards: string;
}

// 格式化 bigint 为可读字符串
const formatBigInt = (value: bigint, decimals: number = 18): string => {
  try {
    // 使用viem的formatUnits
    return formatUnits(value, decimals);
  } catch (error) {
    console.log("formatBigInt error", error);
    return value.toString();
  }
};

// 计算剩余时间
const calculateTimeLeft = (
  targetTime: bigint
): { days: number; hours: number; minutes: number; seconds: number } => {
  const now = Math.floor(Date.now() / 1000);
  const target = Number(targetTime);
  const diff = Math.max(0, target - now);

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
  
  // 计算状态
  const hasStarted = now >= Number(idoInfo.beginTime);
  const hasEnded = now > Number(idoInfo.endTime);
  const isActive = hasStarted && !hasEnded;

  // 根据状态计算倒计时
  const timeLeft = hasStarted ? 
    calculateTimeLeft(idoInfo.endTime) : // 如果已开始，显示距离结束的时间
    calculateTimeLeft(idoInfo.beginTime); // 如果未开始，显示距离开始的时间

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
    hasStarted,
    hasEnded,
    timeLeft,
  };
};

// 创建默认的 publicClient
const createDefaultPublicClient = () => {
  const isTestnet = getCurrentNetworkEnv() === 'testnet';
  const network = isTestnet ? bscTestnet : bsc;
  
  // 配置多个 RPC URL 以提高可靠性
  const rpcUrls = [
    // 使用配置的 RPC URL
    getRpcUrl(),
    // 使用网络默认的 RPC URL
    ...network.rpcUrls.default.http,
  ];

  // 创建带有 fallback 的 transport
  const transport = fallback(
    rpcUrls.map(url => http(url))
  );

  const chainConfig: Chain = {
    ...network,
    rpcUrls: {
      ...network.rpcUrls,
      default: {
        ...network.rpcUrls.default,
        http: rpcUrls,
      },
    },
  };

  return createPublicClient({
    chain: chainConfig,
    transport,
    batch: {
      multicall: true,
    },
  });
};

// 创建一个单例的 defaultPublicClient
const defaultPublicClient = createDefaultPublicClient();

// 获取IDO信息的Hook
export const useIDOInfo = (enabled: boolean = true) => {
  console.log("=== useIDOInfo Hook 开始 ===");
  console.log("传入的 enabled 参数:", enabled);

  const wagmiPublicClient = usePublicClient();
  const { address, isConnected } = useAccount();

  // 使用已连接的客户端或默认客户端
  const publicClient = wagmiPublicClient || defaultPublicClient;

  console.log("publicClient 存在:", !!publicClient);
  console.log("address:", address);
  console.log("isConnected:", isConnected);

  // 修改 enabled 逻辑，只依赖传入的 enabled 参数
  const finalEnabled = enabled;
  console.log("最终的 enabled 状态:", finalEnabled);
  console.log("=== useIDOInfo Hook 结束 ===");

  const queryResult = useQuery<ParsedIDOInfo>({
    queryKey: ["idoInfo"],
    queryFn: async () => {
      console.log("=== queryFn 开始执行 ===");

      const contractAddress = getContractAddress() as `0x${string}`;
      console.log("contractAddress:", contractAddress);
      console.log("当前网络环境:", getCurrentNetworkEnv());
      console.log("当前网络名称:", getNetworkName());

      try {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: idoAbi,
          functionName: "getIDOInfo",
          args: [],
        }) as [bigint, bigint, `0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`, number, bigint, bigint, bigint];

        console.log("合约调用结果:", result);

        // 将结果转换为IDOInfo类型
        const idoInfo: IDOInfo = {
          price: result[0],
          sDBTPerShare: result[1],
          usdtToken: result[2],
          sDBTToken: result[3],
          sbtToken: result[4],
          treasury: result[5],
          status: result[6],
          totalShares: result[7],
          beginTime: result[8],
          endTime: result[9],
        };

        console.log("解析后的 IDO 信息:", idoInfo);
        const parsedInfo = parseIDOInfo(idoInfo);
        console.log("最终解析结果:", parsedInfo);

        return parsedInfo;
      } catch (error) {
        console.log("❌ 合约调用失败:", error);
        // 使用错误处理工具处理错误
        const errorMessage = handleReadContractError(error);
        throw new Error(errorMessage);
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
    data: queryResult.data,
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
          level: level as WhitelistLevel,
          isWhitelisted: level > 0,
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

// 获取推荐统计信息的Hook
export const useReferralStats = (
  referrer: string | undefined,
  enabled: boolean = true
) => {
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  // 计算最终的 enabled 状态
  const finalEnabled = enabled && !!publicClient && isConnected && !!referrer;

  return useQuery<ParsedReferralStats>({
    queryKey: ["referralStats", referrer],
    queryFn: async () => {
      if (!publicClient || !referrer) {
        throw new Error("Public client or referrer not available");
      }

      const contractAddress = getContractAddress() as `0x${string}`;
      console.log("查询推荐统计 - 地址:", referrer);

      try {
        const result = (await publicClient.readContract({
          address: contractAddress,
          abi: idoAbi,
          functionName: "getReferralStats",
          args: [referrer as `0x${string}`],
        })) as unknown[];

        console.log("推荐统计结果:", result);

        // 将结果转换为ReferralStats类型
        const stats: ReferralStats = {
          referralCount: result[0] as bigint,
          sbtsMinted: result[1] as bigint,
          sbtsClaimable: result[2] as bigint,
        };

        // 转换为更易于使用的格式
        return {
          referralCount: Number(stats.referralCount),
          sbtsMinted: Number(stats.sbtsMinted),
          sbtsClaimable: Number(stats.sbtsClaimable),
        };
      } catch (error) {
        console.error("查询推荐统计失败:", error);
        throw error;
      }
    },
    enabled: finalEnabled,
    staleTime: 30000, // 30秒缓存
    gcTime: 300000, // 5分钟
  });
};

// 获取未领取奖励的Hook
export const useUnclaimedRewards = (
  account: string | undefined,
  isWhitelisted: boolean,
  enabled: boolean = true
) => {
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  // 计算最终的 enabled 状态
  const finalEnabled =
    enabled && !!publicClient && isConnected && !!account && isWhitelisted;

  return useQuery<ParsedUnclaimedRewards>({
    queryKey: ["unclaimedRewards", account],
    queryFn: async () => {
      if (!publicClient || !account) {
        throw new Error("Public client or account not available");
      }

      const contractAddress = getContractAddress() as `0x${string}`;
      console.log("查询未领取奖励 - 地址:", account);

      try {
        const result = (await publicClient.readContract({
          address: contractAddress,
          abi: idoAbi,
          functionName: "getUnclaimedRewards",
          args: [account as `0x${string}`],
        })) as bigint;

        console.log("未领取奖励结果:", result);

        // 转换为更易于使用的格式
        const rewards = result;
  return {
          rewards: rewards.toString(),
          formattedRewards: formatBigInt(rewards, 18), // 假设奖励使用18位小数，如果不是请调整
        };
      } catch (error) {
        console.error("查询未领取奖励失败:", error);
        throw error;
      }
    },
    enabled: finalEnabled && isWhitelisted,
    staleTime: 30000, // 30秒缓存
    gcTime: 300000, // 5分钟
  });
};
