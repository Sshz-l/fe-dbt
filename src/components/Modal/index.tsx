"use client";

import {
  Box,
  Text,
  Flex,
  Button,
  VStack,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useReferrer } from "@/hooks/useReferrer";
import { useUSDT } from "@/hooks/useUSDT";
import { useIDOParticipation } from "@/hooks/useIDOParticipation";
import { getContractAddress } from "@/config/networks";
import { useEffect } from "react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const { referrer, getReferrerStatus } = useReferrer();
  const { getUSDTStatus, handleApprove, isApproving } = useUSDT(getContractAddress());
  const { handleParticipate, isParticipating } = useIDOParticipation();
  const toast = useToast();

  // 获取当前状态
  const referrerStatus = getReferrerStatus();
  const usdtStatus = getUSDTStatus();

  // 显示推荐人验证失败提示
  useEffect(() => {
    if (isOpen && referrerStatus.reason && !referrerStatus.isValid) {
      toast({
        title: "推荐人验证",
        description: referrerStatus.reason,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isOpen, referrerStatus.reason, referrerStatus.isValid, toast]);

  // 获取按钮状态
  const getButtonStatus = () => {
    if (!referrerStatus.isValid) {
      return {
        text: referrerStatus.message,
        disabled: referrerStatus.buttonDisabled,
        onClick: undefined,
      };
    }

    if (!usdtStatus.isValid) {
      if (usdtStatus.needsApproval) {
        return {
          text: '授权USDT',
          disabled: false,
          onClick: handleApprove,
          loading: isApproving,
        };
      }
      return {
        text: usdtStatus.message,
        disabled: usdtStatus.buttonDisabled,
        onClick: undefined,
      };
    }

    return {
      text: '确认认购',
      disabled: false,
      onClick: () => referrer && handleParticipate(referrer),
      loading: isParticipating,
    };
  };

  const buttonStatus = getButtonStatus();

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="16px"
        p={6}
        pt={4}
        maxW="400px"
        w="full"
        position="relative"
        boxShadow="xl"
      >
        {/* 标题和关闭按钮 */}
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="20px" fontWeight="bold" color="black">
            认购
          </Text>
          <Box
            as="button"
            onClick={onClose}
            cursor="pointer"
            fontSize="30px"
            color="black"
            _hover={{ opacity: 0.7 }}
          >
            ×
          </Box>
        </Flex>

        <VStack gap={4} align="stretch">
          {/* 认购数量 */}
          <Box
            p={4}
            borderRadius="12px"
            border="1px solid"
            borderColor="gray.200"
          >
            <Flex justify="space-between" align="center">
              <Text fontSize="14px" color="gray.600">
                认购数量
              </Text>
              <Text fontSize="16px" fontWeight="600" color="black">
                5000 DBT
              </Text>
            </Flex>
          </Box>

          {/* 认购金额 */}
          <Box
            p={4}
            borderRadius="12px"
            border="1px solid"
            borderColor="gray.200"
          >
            <Flex justify="space-between" align="center">
              <Text fontSize="14px" color="gray.600">
                认购金额
              </Text>
              <HStack gap={2}>
                <Text fontSize="16px" fontWeight="600" color="black">
                  330 USDT
                </Text>
              </HStack>
            </Flex>
          </Box>

          {/* 推荐人地址 */}
          <Box
            p={4}
            borderRadius="12px"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack gap={2} align="stretch">
              <Text fontSize="14px" color="gray.600">
                推荐人地址
              </Text>
              <Text
                bg="white"
                fontSize="16px"
                fontWeight={800}
                wordBreak="break-all"
              >
                {referrer || '无'}
              </Text>
            </VStack>
          </Box>

          {/* 确认按钮 */}
          <Button
            onClick={buttonStatus.onClick}
            isDisabled={buttonStatus.disabled}
            isLoading={buttonStatus.loading}
            bg="#21C161"
            color="white"
            size="lg"
            borderRadius="12px"
            _hover={{ bg: "#1AAD56" }}
            _active={{ bg: "#189A4C" }}
            fontSize="16px"
            fontWeight="600"
            py={4}
          >
            {buttonStatus.text}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
