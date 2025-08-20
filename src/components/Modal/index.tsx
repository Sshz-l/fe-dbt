"use client";

import {
  Box,
  Text,
  Flex,
  Button,
  VStack,
  HStack,
  useToast,
  Link,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useReferrer } from "@/hooks/useReferrer";
import { useUSDT } from "@/hooks/useUSDT";
import { useIDOParticipation } from "@/hooks/useIDOParticipation";
import { useWhitelistLevel } from "@/hooks/useIdoData";
import { useCallback } from "react";
import { useI18n } from "@/i18n/context";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal = ({
  isOpen,
  onClose,
}: SubscriptionModalProps) => {
  const { referrer, getReferrerStatus } = useReferrer();
  const { address } = useAccount();
  const { getUSDTStatus, handleApprove, isApproving } = useUSDT(
    address as string
  );
  const { data: whitelistInfo } = useWhitelistLevel(true);
  const {
    handleParticipate,
    isParticipating,
    hasParticipated,
    participationTime,
    refetchParticipation,
  } = useIDOParticipation();
  const toast = useToast();
  const { t } = useI18n();
  // 获取当前状态
  const referrerStatus = getReferrerStatus();
  const usdtStatus = getUSDTStatus();

  // 格式化认购时间
  const formatParticipationTime = (timestamp: number) => {
    if (timestamp === 0) return "";
    return new Date(timestamp * 1000).toLocaleString();
  };

  // // 显示推荐人验证失败提示
  // useEffect(() => {
  //   if (
  //     isOpen &&
  //     referrerStatus.reason &&
  //     !referrerStatus.isValid &&
  //     !hasParticipated
  //   ) {
  //     toast({
  //       title: "推荐人验证",
  //       description: referrerStatus.reason,
  //       status: "warning",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   }
  // }, [
  //   isOpen,
  //   referrerStatus.reason,
  //   referrerStatus.isValid,
  //   toast,
  //   hasParticipated,
  // ]);

  // 处理认购成功
  const handleParticipateSuccess = useCallback(async () => {
    console.log("handleParticipateSuccess", referrer);
    if (!referrer) return;
    try {
      // 显示交易等待提示
      const pendingToast = toast({
        title: t("common.transactionPending"),
        description: t("common.pleaseWait"),
        status: "info",
        duration: null,
        isClosable: false,
      });

      try {
        // 发送认购交易
        const hash = await handleParticipate(referrer);

        // 如果用户取消了交易，hash 会是 null
        if (!hash) {
          toast.close(pendingToast);
          return;
        }

        // 等待交易被确认（通过 useWatchContractEvent 在 useIDOParticipation 中处理）
        // 刷新认购状态
        await refetchParticipation();

        // 关闭等待提示
        toast.close(pendingToast);

        // 在链上交易确认后显示成功提示
        toast({
          title: t("common.subscriptionSuccess"),
          description: (
            <Text>
              {t("common.subscriptionSuccessDesc")}
              <br />
              <Link href={`https://testnet.bscscan.com/tx/${hash}`} isExternal color="#FFFFFF">
                {t("common.viewOnExplorer")} ↗
              </Link>
            </Text>
          ),
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        // 关闭等待提示
        toast.close(pendingToast);
        
        // 交易失败
        toast({
          title: t("common.transactionFailed"),
          description: error instanceof Error ? error.message : t("common.transactionFailedDesc"),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      // 用户取消或其他错误
      toast({
        title: t("common.subscriptionFailed"),
        description:
          error instanceof Error
            ? error.message
            : t("common.subscriptionFailedDesc"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [referrer, handleParticipate, refetchParticipation, toast, t]);

  // 获取按钮状态
  const getButtonStatus = () => {
    // 如果已经参与过认购
    if (hasParticipated) {
      return {
        text: `${t("common.participated")} (${formatParticipationTime(participationTime)})`,
        disabled: true,
        onClick: undefined,
      };
    }

    // 检查白名单等级
    if (whitelistInfo?.level === 1) {
      return {
        text: t("common.L0NotParticipate"),
        disabled: true,
        onClick: undefined,
      };
    }

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
          text: t("common.approveUSDT"),
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
      text: t("common.bindAndParticipate"),
      disabled: false,
      onClick: handleParticipateSuccess,
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
        maxH="90vh"
        overflowY="auto"
      >
        {/* 标题和关闭按钮 */}
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="20px" fontWeight="bold" color="black">
            {t("common.subscription")}
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
                {t("common.subscriptionAmount")}
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
                {t("common.subscriptionAmount")}
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
                {t("common.referrerAddress")}
              </Text>
              <Text
                bg="white"
                fontSize="16px"
                fontWeight={800}
                wordBreak="break-all"
              >
                {referrer || t("common.noReferrer")}
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
