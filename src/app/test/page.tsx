'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { useNetworkSwitch } from '@/hooks/useNetworkSwitch';
import { Box, Button, VStack, HStack, Text, Input, Badge, Heading } from '@chakra-ui/react';
import { useToast } from '@/hooks/useToast';
import { formatUnits } from 'viem';
import idoAbi from '@/abis/ido.json';

// 合约地址配置
const CONTRACTS = {
  IDO: '0x2342bE8Bb502E980dE80A59a1cAe7ac3F4A1200D' as `0x${string}`,
};

// IDO信息类型
interface IDOInfo {
  price: bigint;
  sDBTPerShare: bigint;
  usdtToken: `0x${string}`;
  sDBTToken: `0x${string}`;
  sbtToken: `0x${string}`;
  treasury: `0x${string}`;
  status: number;
  totalShares: bigint;
  beginTime: bigint;
  endTime: bigint;
}

export default function TestPage() {
  const { address, isConnected,chainId } = useAccount();
  const { isCorrectNetwork, switchToCorrectNetwork, networkName } = useNetworkSwitch();
  const toast = useToast();

  // 状态管理
  const [whitelistAddress, setWhitelistAddress] = useState('');
  const [whitelistLevel, setWhitelistLevel] = useState('1');
  const [checkAddress, setCheckAddress] = useState('');
  const [whitelistStatus, setWhitelistStatus] = useState<number | null>(null);
  const [idoInfo, setIdoInfo] = useState<IDOInfo | null>(null);
console.log('chainId',chainId);
  // 合约交互hooks
  const {data: hash,writeContractAsync, isPending: isWritePending } = useWriteContract();

    // 监听交易结果
    const waitTxRes = useWaitForTransactionReceipt({
      hash: hash,
      chainId: chainId,
      confirmations: 3,
    })


    useEffect(() => {
      if (waitTxRes?.isSuccess) {
        toast.success({
          title: '交易成功！',
          description: '交易已成功执行',
        })

      }
      if (waitTxRes?.isError) {
        toast.error({
          title: '交易失败！',
          description: '交易失败: ' + (waitTxRes?.error?.message || '未知错误'),
        })
      }
    }, [waitTxRes?.isSuccess, waitTxRes?.isError, waitTxRes?.error?.message, toast])

  // 读取合约数据
  const { data: idoInfoData, refetch: refetchIDOInfo } = useReadContract({
    address: CONTRACTS.IDO,
    abi: idoAbi,
    functionName: 'getIDOInfo',
  });

  const { data: whitelistLevelData, refetch: refetchWhitelistLevel } = useReadContract({
    address: CONTRACTS.IDO,
    abi: idoAbi,
    functionName: 'getWhitelistLevel',
    args: [checkAddress as `0x${string}`],
  });

  // 监听数据变化
  useEffect(() => {
    if (idoInfoData && isConnected) {
      const data = idoInfoData as readonly [bigint, bigint, `0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`, number, bigint, bigint, bigint];
      setIdoInfo({
        price: data[0],
        sDBTPerShare: data[1],
        usdtToken: data[2],
        sDBTToken: data[3],
        sbtToken: data[4],
        treasury: data[5],
        status: data[6],
        totalShares: data[7],
        beginTime: data[8],
        endTime: data[9],
      });
    }
  }, [idoInfoData, isConnected]);

  useEffect(() => {
    if (whitelistLevelData !== undefined) {
      setWhitelistStatus(Number(whitelistLevelData));
    }
  }, [whitelistLevelData]);

  // 添加地址到白名单
  const handleAddToWhitelist = useCallback(async () => {
    if (!whitelistAddress || !whitelistLevel) {
      toast.error({
        title: '参数错误',
        description: '请填写地址和白名单等级',
      });
      return;
    }

    try {
      await writeContractAsync({
        address: CONTRACTS.IDO,
        abi: idoAbi,
        functionName: 'addToWhitelist',
        args: [whitelistAddress as `0x${string}`, Number(whitelistLevel)],
      });
      
      toast.info({
        title: '交易已提交',
        description: '添加白名单交易已提交到区块链',
      });
    } catch (error) {
      toast.error({
        title: '交易失败',
        description: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    }
  }, [whitelistAddress, whitelistLevel, writeContractAsync, toast]);

  // 从白名单移除地址
  const handleRemoveFromWhitelist = useCallback(async () => {
    if (!whitelistAddress) {
      toast.error({
        title: '参数错误',
        description: '请填写要移除的地址',
      });
      return;
    }

    try {
      await writeContractAsync({
        address: CONTRACTS.IDO,
        abi: idoAbi,
        functionName: 'removeFromWhitelist',
        args: [whitelistAddress as `0x${string}`],
      });
      
      toast.info({
        title: '移除交易已提交',
        description: '从白名单移除地址的交易已提交',
      });
    } catch (error) {
      toast.error({
        title: '交易失败',
        description: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    }
  }, [whitelistAddress, writeContractAsync, toast]);

  // 检查白名单状态
  const handleCheckWhitelist = useCallback(() => {
    if (!checkAddress) {
      toast.error({
        title: '参数错误',
        description: '请填写要检查的地址',
      });
      return;
    }
    refetchWhitelistLevel();
  }, [checkAddress, refetchWhitelistLevel, toast]);

  // 刷新数据
  const handleRefreshData = useCallback(() => {
    refetchIDOInfo();
    toast.success({
      title: '数据已刷新',
      description: '合约数据已更新',
    });
  }, [refetchIDOInfo, toast]);

  if (!isConnected) {
    return (
      <Box p={8} textAlign="center">
        <Box p={4} bg="orange.100" borderRadius="md" border="1px solid" borderColor="orange.300">
          <Text color="orange.800" fontWeight="bold">请先连接钱包</Text>
        </Box>
      </Box>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Box p={8} textAlign="center">
        <Box p={4} bg="red.100" borderRadius="md" border="1px solid" borderColor="red.300" mb={4}>
          <Text color="red.800" fontWeight="bold">当前网络不正确，请切换到 {networkName}</Text>
        </Box>
        <Button onClick={switchToCorrectNetwork}>
          切换网络
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <Heading mb={6} textAlign="center">DBT 合约测试页面</Heading>
      
      {/* 网络状态 */}
      <Box mb={6} p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={2}>
            <Text fontWeight="bold">网络状态</Text>
            <Badge colorScheme="green">{networkName}</Badge>
            <Text fontSize="sm">钱包地址: {address}</Text>
          </VStack>
          <Button size="sm" onClick={handleRefreshData} loading={isWritePending}>
            刷新数据
          </Button>
        </HStack>
      </Box>

      <HStack gap={6} align="start">
        {/* 左侧：白名单管理 */}
        <VStack flex={1} gap={6}>
          <Box w="100%" p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm">
            <Heading size="md" mb={4}>白名单管理</Heading>
            
            {/* 添加地址到白名单 */}
            <VStack gap={3} mb={4}>
              <Text fontWeight="bold">添加地址到白名单</Text>
              <Input
                placeholder="输入钱包地址 (0x...)"
                value={whitelistAddress}
                onChange={(e) => setWhitelistAddress(e.target.value)}
              />
              <select
                value={whitelistLevel}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWhitelistLevel(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="1">等级 1 (L0)</option>
                <option value="2">等级 2 (L1)</option>
                <option value="3">等级 3 (L2)</option>
              </select>
              <Button
                colorScheme="blue"
                onClick={handleAddToWhitelist}
                loading={isWritePending}
                w="100%"
              >
                添加到白名单
              </Button>
            </VStack>

            <Box borderTop="1px solid" borderColor="gray.200" my={4} />

            {/* 移除地址 */}
            <VStack gap={3}>
              <Text fontWeight="bold">从白名单移除地址</Text>
              <Input
                placeholder="输入要移除的地址 (0x...)"
                value={whitelistAddress}
                onChange={(e) => setWhitelistAddress(e.target.value)}
              />
              <Button
                colorScheme="red"
                onClick={handleRemoveFromWhitelist}
                loading={isWritePending}
                w="100%"
              >
                从白名单移除
              </Button>
            </VStack>
          </Box>
        </VStack>

        {/* 右侧：查询和状态 */}
        <VStack flex={1} gap={6}>
          {/* 白名单状态查询 */}
          <Box w="100%" p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm">
            <Heading size="md" mb={4}>白名单状态查询</Heading>
            <VStack gap={3}>
              <Input
                placeholder="输入要查询的地址 (0x...)"
                value={checkAddress}
                onChange={(e) => setCheckAddress(e.target.value)}
              />
              <Button onClick={handleCheckWhitelist} w="100%">
                查询状态
              </Button>
              {whitelistStatus !== null && (
                <Box 
                  p={3} 
                  bg={whitelistStatus > 0 ? "green.100" : "blue.100"} 
                  borderRadius="md" 
                  border="1px solid" 
                  borderColor={whitelistStatus > 0 ? "green.300" : "blue.300"}
                >
                  <Text color={whitelistStatus > 0 ? "green.800" : "blue.800"} fontWeight="bold">
                    白名单等级: {whitelistStatus > 0 ? `L${whitelistStatus - 1}` : "未在白名单中"}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          {/* IDO 信息 */}
          <Box w="100%" p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm">
            <Heading size="md" mb={4}>IDO 合约信息</Heading>
            {idoInfo ? (
              <VStack gap={2} align="start">
                <Text><strong>价格:</strong> {formatUnits(idoInfo.price, 18)} USDT</Text>
                <Text><strong>每份 sDBT:</strong> {formatUnits(idoInfo.sDBTPerShare, 18)}</Text>
                <Text><strong>状态:</strong> {idoInfo.status}</Text>
                <Text><strong>总份额:</strong> {formatUnits(idoInfo.totalShares, 18)}</Text>
                <Text><strong>开始时间:</strong> {new Date(Number(idoInfo.beginTime) * 1000).toLocaleString()}</Text>
                <Text><strong>结束时间:</strong> {new Date(Number(idoInfo.endTime) * 1000).toLocaleString()}</Text>
              </VStack>
            ) : (
              <Text>加载中...</Text>
            )}
          </Box>
        </VStack>
      </HStack>

      {/* 底部提示 */}
      <Box mt={8} textAlign="center">
        <Box p={4} bg="blue.100" borderRadius="md" border="1px solid" borderColor="blue.300">
          <Text color="blue.800" fontWeight="bold">
            此页面仅用于测试和配置，请在生产环境中谨慎使用
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
