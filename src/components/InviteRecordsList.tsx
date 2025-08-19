'use client';

import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
} from '@chakra-ui/react';
import { useInviteRecords } from '@/hooks/useInviteRecords';
import { useAccount } from 'wagmi';

export const InviteRecordsList = () => {
  const { invitees, total, hasMore, loadMore } = useInviteRecords();
  const { address: userAddress } = useAccount();

  // 格式化地址显示
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!userAddress) return null;

  if (!invitees?.length) {
    return (
      <Box p={4}>
        <Text color="gray.500">暂无邀请记录</Text>
      </Box>
    );
  }

  return (
    <VStack gap={2} align="stretch">
      {/* 邀请列表 */}
      <VStack gap={0} align="stretch">
        {/* 列表头部 */}
        <HStack
          bg="gray.50"
          p="16px"
          fontSize="12px"
          color="#000000"
          fontWeight="400"
        >
          <Box flex={1}>钱包地址</Box>
          <Box flex={1} textAlign="right">认购金额</Box>
        </HStack>

        {/* 列表内容 */}
        {invitees.map((address) => (
          <Box key={address} w="full">
            <HStack
              px="16px"
              py="8px"
              bg="white"
              borderRadius="md"
              _hover={{ bg: "gray.50" }}
              transition="all 0.2s"
            >
              <Box flex={1} fontSize="12px" color="#000000" fontWeight="500">
                {formatAddress(address)}
              </Box>
              <Box flex={1} fontSize="12px" color="#000000" fontWeight="500" textAlign="right">
                330 USDT
              </Box>
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* 加载更多按钮 */}
      {hasMore && (
        <Button
          size="sm"
          variant="ghost"
          onClick={loadMore}
          w="full"
          color="gray.500"
          _hover={{ bg: "gray.50" }}
        >
          加载更多
        </Button>
      )}
    </VStack>
  );
}; 