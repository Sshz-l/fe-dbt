"use client";

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Center,
  Flex,
  Image,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useAccount, useBalance } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import dynamic from "next/dynamic";

// import { useIdoData } from "@/hooks/useIdoData";
import { useWalletStore } from "@/store/useStore";
import WidthLayout from "@/components/WidthLayout";
// import { Header } from "@/components/Header";
import { useI18n } from "@/i18n/context";
import { useRouter } from "next/navigation";
import logo from "@/assets/img/dbt_logo.png";
import rewardLogo from "@/assets/img/reward.png";
import { SubscriptionModal } from "@/components/Modal";
import { useIDOInfo } from "@/hooks/useIdoData";
import { useWhitelistLevel } from "@/hooks/useIdoData";
import { useSignature } from "@/hooks/useSignature";
import { useWalletAction } from "@/hooks/useWalletAction";

const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
});

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { setAccount, setBalance } = useWalletStore();
  const { t } = useI18n();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // 使用签名 Hook
  const {
    hasValidSignature,
    signForIDOParticipation,
    isLoading: isSigning,
  } = useSignature();

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 2,
    seconds: 31,
    milliseconds: 32,
  });
  const [activeTab, setActiveTab] = useState("intro"); // 默认显示项目介绍
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // 使用 IDO 信息 Hook
  const {
    data: idoInfo,
  } = useIDOInfo();

  // 获取白名单等级
  const { data: whitelistInfo } = useWhitelistLevel(isConnected);
  const isWhitelisted = whitelistInfo?.isWhitelisted ?? false;

  // 定义标签页配置
  const tabs = [
    { id: "intro", label: t("common.projectIntro") },
    { id: "my", label: t("common.mySubscription") },
    { id: "invites", label: t("common.inviteRecord") },
    ...(isWhitelisted ? [{ id: "recommended", label: t("common.recommended") }] : []),
  ];

  console.log("idoInfo", idoInfo);

  useEffect(() => {
    setIsClient(true);
    if (isConnected && address) {
      setAccount(address);
      if (balanceData) {
        const formattedBalance = ethers.formatEther(balanceData.value);
        setBalance(formattedBalance);
      }
    } else {
      setAccount(null);
      setBalance("0");
    }
  }, [isConnected, address, balanceData, setAccount, setBalance]);

  // 如果当前选中的标签不在可用标签列表中，则切换到项目介绍
  useEffect(() => {
    const availableTabIds = tabs.map((tab) => tab.id);
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab("intro");
    }
  }, [tabs, activeTab]);

  // 倒计时效果
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.milliseconds > 0) {
          return { ...prev, milliseconds: prev.milliseconds - 1 };
        } else if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1, milliseconds: 59 };
        } else if (prev.minutes > 0) {
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
            milliseconds: 59,
          };
        } else if (prev.hours > 0) {
          return {
            ...prev,
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59,
            milliseconds: 59,
          };
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // 模拟认购数据
  const subscriptionData = [
    { address: "ABC...ABC", time: "2025-03-04 33:33:33", amount: "330 USDT" },
    { address: "ABC...ABC", time: "2025-03-04 33:33:33", amount: "330 USDT" },
    { address: "ABC...ABC", time: "2025-03-04 33:33:33", amount: "330 USDT" },
    { address: "ABC...ABC", time: "2025-03-04 33:33:33", amount: "330 USDT" },
  ];

  // 使用通用钱包操作 hook
  const { wrapAction } = useWalletAction({
    onError: (error) => {
      // 可以添加错误提示
      console.error(error);
    },
  });

  // 处理参与认购
  const handleJoinIDO = useCallback(() => {
    wrapAction(async () => {
      if (!hasValidSignature) {
        await signForIDOParticipation();
      }
      setIsSubscriptionModalOpen(true);
    });
  }, [wrapAction, hasValidSignature, signForIDOParticipation]);

  // 处理邀请好友
  const handleInviteFriend = useCallback(() => {
    wrapAction(async () => {
      if (!hasValidSignature) {
        await signForIDOParticipation();
      }
      router.push("/share");
    });
  }, [wrapAction, router, hasValidSignature, signForIDOParticipation]);

  // 处理领取奖励
  const handleClaim = useCallback(() => {
    wrapAction(async () => {
      if (!hasValidSignature) {
        await signForIDOParticipation();
      }
      // TODO: 实现领取奖励的逻辑
      console.log("领取奖励");
    });
  }, [wrapAction, hasValidSignature, signForIDOParticipation]);

  // 处理签名请求
  const handleSignatureRequest = async () => {
    if (!address || hasValidSignature || isSigning) return;

    try {
      await signForIDOParticipation();
      // 签名成功后不需要额外操作，因为 hasValidSignature 会自动更新
    } catch (error) {
      console.error("签名失败:", error);
    }
  };

  if (!isClient) {
    return (
      <Center p={8} maxW="md" mx="auto">
        <VStack gap={6} align="stretch">
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <WidthLayout>
      <Header />
      <Box p="20px" maxW="100%" mx="auto">
        <VStack align="stretch" gap={4}>
          {/* 顶部：代币信息和认购详情 */}
          <Box>
            <Box bg="white" p="16px" border="1px solid" borderColor="#0000001A">
              <Flex justify="space-between" align="start" mb={4}>
                <Image src={logo.src} alt="DBT" w="52px" h="52px" />
                <Badge
                  // colorScheme="green"
                  variant="solid"
                  px={3}
                  py={1}
                  borderRadius="md"
                  bg="#21C161"
                  color="white"
                >
                  {t("common.ongoing")}
                </Badge>
              </Flex>
              <Box>
                <Text fontSize="18px" fontWeight="bold" color="gray.800">
                  DBT Ecological Protocol Token
                </Text>
                <Text color="#000000" fontSize="12px" fontWeight={400} mt={2}>
                  {t("common.dbtDesc")}
                </Text>
              </Box>
              <Flex direction={"column"} gap={2} mt={4}>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    {t("common.idoPrice")}:
                  </Text>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    1DBT=0.066USDT
                  </Text>
                </Flex>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    {t("common.idoProPrice")}:
                  </Text>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    1DBT=0.2USDT
                  </Text>
                </Flex>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    {t("common.minSubscriptionAmount")}:
                  </Text>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    330USDT/5000DBT
                  </Text>
                </Flex>
              </Flex>
            </Box>

            {/* 认购结束时间 */}
            <Flex
              justify="space-between"
              align="start"
              bg={"#FAFAFC"}
              p={4}
              border="1px solid"
              borderColor="#0000001A"
              borderTop="none"
            >
              <Box>
                <Text fontSize="12px" fontWeight={400} color="#000000">
                  {t("common.endTime")}:
                </Text>
                <Text fontSize="14px" fontWeight={500} color="#000000">
                  {String(timeLeft.hours).padStart(2, "0")}:
                  {String(timeLeft.minutes).padStart(2, "0")}:
                  {String(timeLeft.seconds).padStart(2, "0")}:
                  {String(timeLeft.milliseconds).padStart(2, "0")}
                </Text>
              </Box>
              {/* 点击参与认购后弹出弹窗，弹窗内容为 Modal 组件 */}
              <Button
                // colorScheme="green"
                size="sm"
                borderRadius="none"
                bg="#bcf3d2"
                color="#21C161"
                _hover={{ bg: "#bcf3d2", opacity: 0.8 }}
                _active={{ bg: "#bcf3d2", opacity: 0.8 }}
                fontSize="12px"
                fontWeight="600"
                h="34px"
                onClick={handleJoinIDO}
              >
                {t("common.joinIDO")}
              </Button>
            </Flex>
          </Box>

          {/* 中部：推荐奖励系统 */}
          <Box bg="white" p="16px" border="1px solid" borderColor="#0000001A">
            <Flex justify="space-between" align="center">
              <HStack gap={3}>
                <Image src={rewardLogo.src} alt="reward" w="42px" h="42px" />
                <VStack align="start" gap={1}>
                  <Text color="green.500" fontWeight="bold" fontSize="14px">
                    {t("common.inviteFriendFee")}
                  </Text>
                  <Text color="#333333" fontSize="12px" fontWeight="600">
                    {t("common.value")}
                    <Text as="span" color="#21C161" mx="2px">
                      1320USDT
                    </Text>
                    {t("common.fee")}
                  </Text>
                </VStack>
              </HStack>
              {/* 不需要显示需要签名，如果没登录点击就弹出登录 */}
              <Button
                size="sm"
                borderRadius="none"
                bg="#21C161"
                _hover={{ bg: "#21C161", opacity: 0.8 }}
                _active={{ bg: "#21C161", opacity: 0.8 }}
                fontSize="12px"
                fontWeight="600"
                color="white"
                h="34px"
                // disabled={!hasValidSignature}
                onClick={handleInviteFriend}
              >
                {t("common.inviteFriend")}
                {/* {hasValidSignature ? t("common.inviteFriend") : t("common.pleaseSignFirst")} */}
              </Button>
            </Flex>
          </Box>

          {/* 底部：标签页 */}
          <Box bg="white">
            {/* 未签名提示 - 只在连接钱包且未签名且点击过签名按钮时显示 */}
            {/* {isConnected && !hasValidSignature && !isSigning && (
              <Alert status="warning" mb={4}>
                <AlertIcon />
                <HStack justify="space-between" w="100%" align="center">
                  <Text>{t("common.signatureRequired")}</Text>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={handleSignatureRequest}
                    isLoading={isSigning}
                    loadingText={t("common.signing")}
                  >
                    {t("common.clickToSign")}
                  </Button>
                </HStack>
              </Alert>
            )} */}

            {/* 标签页导航 */}
            <HStack gap={4} fontSize="12px" color="#000000" fontWeight="400">
              {tabs.map((tab) => (
                <Box
                  key={tab.id}
                  py={3}
                  cursor="pointer"
                  borderBottom={activeTab === tab.id ? "2px solid" : "none"}
                  borderColor="black"
                  fontWeight={activeTab === tab.id ? "bold" : "normal"}
                  onClick={() => {
                    // 如果点击非 intro 标签且未连接钱包或未签名，则触发连接和签名流程
                    if (tab.id !== "intro") {
                      wrapAction(async () => {
                        if (!hasValidSignature) {
                          await signForIDOParticipation();
                        }
                        setActiveTab(tab.id);
                      });
                      return;
                    }
                    setActiveTab(tab.id);
                  }}
                >
                  {tab.label}
                </Box>
              ))}
            </HStack>

            {/* 标签页内容 */}
            <Box mt={4}>
              {activeTab === "intro" && (
                <Box
                  bg="white"
                  p="16px"
                  border="1px solid"
                  borderColor="#0000001A"
                >
                  {/* 英文文案一个单词在换行的时候不要断开 */}
                  <Text
                    color="gray.600"
                    fontSize="12px"
                    lineHeight="20px"
                    wordBreak="break-all"
                  >
                    {t("common.dbtInfo")}
                  </Text>
                </Box>
              )}

              {/* 其他标签页内容需要签名后才显示 */}
              {activeTab !== "intro" && (
                <>
                  {!hasValidSignature ? (
                    <Alert status="warning" mb={4}>
                      <AlertIcon />
                      <HStack justify="space-between" w="100%" align="center">
                        <Text>{t("common.signatureRequired")}</Text>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => signForIDOParticipation()}
                          isLoading={isSigning}
                          loadingText={t("common.signing")}
                        >
                          {t("common.clickToSign")}
                        </Button>
                      </HStack>
                    </Alert>
                  ) : (
                    <>
                      {activeTab === "my" && (
                        <Flex
                          bg="white"
                          border="1px solid"
                          borderColor="#0000001A"
                          p="16px"
                          flexDirection={"column"}
                          gap={2}
                        >
                          {/* 我的认购记录 */}
                          <Flex justifyContent={"space-between"}>
                            <Text fontSize="14px" fontWeight="500">
                              {t("common.subscription")} 5000DBT
                            </Text>
                            <Text fontSize="12px" fontWeight="400" color="#21C161">
                              已完成
                            </Text>
                          </Flex>
                          <Flex justifyContent={"space-between"}>
                            <Text fontSize="12px" fontWeight="400" color="#000000">
                              认购单价
                            </Text>
                            <Text fontSize="12px" fontWeight="500" color="#000000">
                              0.066 USDT
                            </Text>
                          </Flex>
                          <Flex justifyContent={"space-between"}>
                            <Text fontSize="12px" fontWeight="400" color="#000000">
                              认购金额
                            </Text>
                            <Text fontSize="12px" fontWeight="500" color="#000000">
                              3330 USDT
                            </Text>
                          </Flex>
                          <Flex justifyContent={"space-between"}>
                            <Text fontSize="12px" fontWeight="400" color="#000000">
                              认购时间
                            </Text>
                            <Text fontSize="12px" fontWeight="500" color="#000000">
                              2025-03-04 33:33:33
                            </Text>
                          </Flex>
                        </Flex>
                      )}

                      {activeTab === "invites" && (
                        <Box bg="white" border="1px solid" borderColor="#0000001A">
                          {/* 列表头部 */}
                          <HStack
                            bg="gray.50"
                            p="16px"
                            fontSize="12px"
                            color="#000000"
                            fontWeight="400"
                          >
                            <Box flex={1}>钱包地址</Box>
                            <Box flex={2}>认购时间</Box>
                            <Box flex={1} textAlign="right">
                              认购金额
                            </Box>
                          </HStack>

                          {/* 认购列表 */}
                          <VStack gap={0}>
                            {subscriptionData.map((item, index) => (
                              <Box key={index} w="full">
                                <HStack
                                  px="16px"
                                  py="8px"
                                  bg="white"
                                  borderRadius="md"
                                  _hover={{ bg: "gray.50" }}
                                  transition="all 0.2s"
                                >
                                  <Box
                                    flex={1}
                                    fontSize="12px"
                                    color="#000000"
                                    fontWeight="500"
                                  >
                                    {item.address}
                                  </Box>
                                  <Box
                                    flex={2}
                                    fontSize="12px"
                                    color="#000000"
                                    fontWeight="500"
                                  >
                                    {item.time}
                                  </Box>
                                  <Box
                                    flex={1}
                                    fontSize="12px"
                                    color="#000000"
                                    fontWeight="500"
                                    textAlign="right"
                                  >
                                    {item.amount}
                                  </Box>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {activeTab === "recommended" && isWhitelisted && (
                        <Box bg="white" border="1px solid" borderColor="#0000001A">
                          {/* 列表头部 */}
                          <HStack
                            bg="gray.50"
                            p="16px"
                            fontSize="12px"
                            color="#000000"
                            fontWeight="400"
                          >
                            <Box flex={1}>钱包地址</Box>
                            <Box flex={2}>认购时间</Box>
                            <Box flex={1} textAlign="right">
                              认购金额
                            </Box>
                          </HStack>

                          {/* 认购列表 */}
                          <VStack gap={0}>
                            {subscriptionData.map((item, index) => (
                              <Box key={index} w="full">
                                <HStack
                                  px="16px"
                                  py="8px"
                                  bg="white"
                                  borderRadius="md"
                                  _hover={{ bg: "gray.50" }}
                                  transition="all 0.2s"
                                >
                                  <Box
                                    flex={1}
                                    fontSize="12px"
                                    color="#000000"
                                    fontWeight="500"
                                  >
                                    {item.address}
                                  </Box>
                                  <Box
                                    flex={2}
                                    fontSize="12px"
                                    color="#000000"
                                    fontWeight="500"
                                  >
                                    {item.time}
                                  </Box>
                                  <Box
                                    flex={1}
                                    fontSize="12px"
                                    color="#000000"
                                    fontWeight="500"
                                    textAlign="right"
                                  >
                                    {item.amount}
                                  </Box>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>

                          {/* 待领取部分 */}
                          <Box px="16px" py="8px" bg="gray.50" borderRadius="md">
                            <Flex justify="space-between" align="center">
                              <VStack align="start" gap={1}>
                                <Text fontSize="12px" color="#000000">
                                  待领取
                                </Text>
                                <Text fontSize="12px" fontWeight="bold" color="#21C161">
                                  88888UDT
                                </Text>
                              </VStack>
                              <Button
                                colorScheme="green"
                                size="sm"
                                borderRadius="none"
                                bg="#21C161"
                                color="white"
                                _hover={{ bg: "#21C161", opacity: 0.8 }}
                                _active={{ bg: "#21C161", opacity: 0.8 }}
                                border="1px solid"
                                borderColor="#21C161"
                                fontSize="12px"
                                fontWeight="600"
                                h="34px"
                                onClick={handleClaim}
                              >
                                领取
                              </Button>
                            </Flex>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>
        </VStack>
      </Box>
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        // onConfirm={() => {}}
      />
    </WidthLayout>
  );
}
