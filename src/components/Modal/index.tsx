"use client";

import React, { useState } from "react";
import {
  Box,
  Text,
  Flex,
  Button,
  VStack,
  HStack,
  Textarea,
} from "@chakra-ui/react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (referrerAddress: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [referrerAddress, setReferrerAddress] = useState("");

  const handleConfirm = () => {
    onConfirm(referrerAddress);
  };

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
              {/* Input支持内容超出多行显示 */}
              <Textarea
                placeholder="请输入推荐人地址"
                value={referrerAddress}
                onChange={(e) => setReferrerAddress(e.target.value)}
                bg="white"
                border="none"
                borderColor="gray.300"
                borderRadius="8px"
                _focus={{
                  outline: "none",
                  border: "none",
                }}
                overflow="auto"
                maxH="100px"
                resize="none"
                fontSize="16px"
                fontWeight={800}
                p={0}
              />
            </VStack>
          </Box>

          {/* 确认按钮 */}
          <Button
            onClick={handleConfirm}
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
            确认认购
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default SubscriptionModal;
