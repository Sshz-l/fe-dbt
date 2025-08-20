"use client";
export const runtime = "edge";

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
  Link,
  useToast,
} from "@chakra-ui/react";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { useEffect, useState, useCallback, useMemo } from "react";
import type { ReactElement } from "react";
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
import { useIDOParticipation } from "@/hooks/useIDOParticipation";
import { InviteRecordsList } from "@/components/InviteRecordsList";
import { useUnclaimedRewards } from "@/hooks/useIdoData";
import idoAbi from "@/abis/ido.json";
import { getContractAddress } from "@/config/networks";

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

  // 统一处理签名逻辑
  const ensureSignature = useCallback(async () => {
    // 先检查钱包连接状态
    if (!isConnected || !address) {
      console.log("钱包未连接，不执行签名");
      return false;
    }
    if (hasValidSignature) return true;
    if (isSigning) return false;

    try {
      await signForIDOParticipation();
      return true;
    } catch (error) {
      console.error("签名失败:", error);
      return false;
    }
  }, [
    isConnected,
    address,
    hasValidSignature,
    isSigning,
    signForIDOParticipation,
  ]);

  const { hasParticipated, participationTime } = useIDOParticipation();
  console.log("hasParticipated", hasParticipated);

  // 设置 activeTab 的类型
  type TabId = "intro" | "my" | "invites" | "recommended";
  const [activeTab, setActiveTab] = useState<TabId>("intro");
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // 使用 IDO 信息 Hook
  const { data: idoInfo } = useIDOInfo();

  // 获取白名单等级
  const { data: whitelistInfo } = useWhitelistLevel(isConnected);
  const isWhitelisted = whitelistInfo?.isWhitelisted ?? false;

  // 是白名单时，获取未领取奖励
  const { data: unclaimedRewards, refetch: refetchUnclaimedRewards } =
    useUnclaimedRewards(address, isWhitelisted);
  console.log("unclaimedRewards", unclaimedRewards);

  // 渲染已签名的内容
  const renderSignedContent = (
    activeTab: TabId,
    hasParticipated: boolean,
    participationTime: number,
    isWhitelisted: boolean
  ): ReactElement | null => {
    if (activeTab === "my" && hasParticipated && participationTime) {
      return (
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
              {t("common.completed")}
            </Text>
          </Flex>
          <Flex justifyContent={"space-between"}>
            <Text fontSize="12px" fontWeight="400" color="#000000">
              {t("common.subscriptionPrice")}
            </Text>
            <Text fontSize="12px" fontWeight="500" color="#000000">
              0.066 USDT
            </Text>
          </Flex>
          <Flex justifyContent={"space-between"}>
            <Text fontSize="12px" fontWeight="400" color="#000000">
              {t("common.subscriptionAmount")}
            </Text>
            <Text fontSize="12px" fontWeight="500" color="#000000">
              3330 USDT
            </Text>
          </Flex>
          <Flex justifyContent={"space-between"}>
            <Text fontSize="12px" fontWeight="400" color="#000000">
              {t("common.subscriptionTime")}
            </Text>
            <Text fontSize="12px" fontWeight="500" color="#000000">
              {new Date(participationTime * 1000).toLocaleString()}
            </Text>
          </Flex>
        </Flex>
      );
    }

    if (activeTab === "invites") {
      return (
        <Box bg="white" border="1px solid" borderColor="#0000001A">
          {/* 邀请记录 */}
          <InviteRecordsList />
        </Box>
      );
    }

    if (activeTab === "recommended" && isWhitelisted) {
      return (
        <Box bg="white" border="1px solid" borderColor="#0000001A">
          {/* 列表头部 */}
          <HStack
            bg="gray.50"
            p="16px"
            fontSize="12px"
            color="#000000"
            fontWeight="400"
          >
            <Box flex={1}>{t("common.walletAddress")}</Box>
            <Box flex={2}>{t("common.subscriptionTime")}</Box>
            <Box flex={1} textAlign="right">
              {t("common.subscriptionAmount")}
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
                  {t("common.pendingClaim")}
                </Text>
                <Text fontSize="12px" fontWeight="bold" color="#21C161">
                  {/* TODO: 调用getUnclaimedRewards获取可领取奖励 */}
                  {unclaimedRewards?.formattedRewards}
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
                isLoading={isClaimLoading}
                disabled={
                  unclaimedRewards?.formattedRewards === "0.0" || isClaimLoading
                }
              >
                {t("common.claim")}
              </Button>
            </Flex>
          </Box>
        </Box>
      );
    }

    return null;
  };

  // 定义标签页配置
  const tabs = useMemo(() => {
    const baseTabs: Array<{ id: TabId; label: string }> = [
      { id: "intro", label: t("common.projectIntro") },
    ];

    if (hasParticipated) {
      baseTabs.push({ id: "invites", label: t("common.inviteRecord") });
    }

    if (hasParticipated) {
      baseTabs.splice(1, 0, { id: "my", label: t("common.mySubscription") });
    }

    if (isWhitelisted) {
      baseTabs.push({ id: "recommended", label: t("common.recommended") });
    }

    return baseTabs;
  }, [t, hasParticipated, isWhitelisted]);

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
      // 断开钱包时清除所有状态
      setAccount(null);
      setBalance("0");
      setActiveTab("intro"); // 重置到介绍页面
      setIsSubscriptionModalOpen(false); // 关闭任何可能打开的模态框
    }
  }, [isConnected, address, balanceData, setAccount, setBalance]);

  // 如果当前选中的标签不在可用标签列表中，则切换到项目介绍
  useEffect(() => {
    const availableTabIds = tabs.map((tab) => tab.id);
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab("intro");
    }
  }, [tabs, activeTab]);

  // 模拟认购数据
  const subscriptionData = [
    { address: "ABC...ABC", time: "2025-03-04 33:33:33", amount: "330 USDT" },
    { address: "ABC...ABC", time: "2025-03-04 33:33:33", amount: "330 USDT" },
    { address: "ABC...ABC", time: "2025-03-04 33:33:33", amount: "330 USDT" },
    { address: "ABC...ABC", time: "2025-03-04 33:33:33", amount: "330 USDT" },
  ];

  // 处理参与认购
  const handleJoinIDO = useCallback(async () => {
    if (await ensureSignature()) {
      setIsSubscriptionModalOpen(true);
    }
  }, [ensureSignature]);

  // 处理邀请好友
  const handleInviteFriend = useCallback(async () => {
    if (await ensureSignature()) {
      router.push("/share");
    }
  }, [ensureSignature, router]);

  // 处理领取奖励
  const { writeContractAsync } = useWriteContract();
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const toast = useToast();

  const handleClaim = useCallback(async () => {
    if (!(await ensureSignature())) return;

    let pendingToast: string | number | undefined;
    try {
      setIsClaimLoading(true);
      // 显示交易等待提示
      pendingToast = toast({
        title: t("common.transactionPending"),
        description: t("common.pleaseWait"),
        status: "info",
        duration: null,
        isClosable: false,
      });

      // 调用withdrawRewards领取奖励
      const hash = await writeContractAsync({
        address: getContractAddress(),
        abi: idoAbi,
        functionName: "withdrawRewards",
        args: [],
      });

      if (!hash) {
        // 用户取消了交易
        toast.close(pendingToast);
        return;
      }

      // 等待数据更新（通过轮询检查）
      const waitForUpdate = new Promise<void>((resolve) => {
        const timer = setInterval(async () => {
          // 尝试刷新数据
          const newRewards = await refetchUnclaimedRewards();
          // 如果数据已更新（奖励变为0），说明领取成功
          if (newRewards.data?.formattedRewards === "0") {
            clearInterval(timer);
            resolve();
          }
        }, 2000); // 每2秒检查一次

        // 60秒后自动停止检查
        setTimeout(() => {
          clearInterval(timer);
          resolve();
        }, 60000);
      });

      // 等待数据更新
      await waitForUpdate;

      // 关闭等待提示
      toast.close(pendingToast);

      // 显示成功提示
      toast({
        title: t("common.claimSuccess"),
        description: (
          <Text>
            {t("common.claimSuccessDesc")}
            <br />
            <Link
              href={`https://testnet.bscscan.com/tx/${hash}`}
              isExternal
              color="#FFFFFF"
            >
              {t("common.viewOnExplorer")} ↗
            </Link>
          </Text>
        ),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      // 确保关闭等待提示
      if (pendingToast) {
        toast.close(pendingToast);
      }

      toast({
        title: t("common.claimFailed"),
        description:
          error instanceof Error ? error.message : t("common.claimFailedDesc"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsClaimLoading(false);
    }
  }, [writeContractAsync, toast, t, refetchUnclaimedRewards, ensureSignature]);

  // 处理签名请求
  // const handleSignatureRequest = async () => {
  //   if (!address || hasValidSignature || isSigning) return;

  //   try {
  //     await signForIDOParticipation();
  //     // 签名成功后不需要额外操作，因为 hasValidSignature 会自动更新
  //   } catch (error) {
  //     console.error("签名失败:", error);
  //   }
  // };

  // 处理标签页切换
  const handleTabClick = useCallback(
    async (tab: TabId) => {
      // 如果是介绍页面，直接切换
      if (tab === "intro") {
        setActiveTab(tab);
        return;
      }

      // 其他页面需要先检查钱包连接状态
      if (!isConnected || !address) {
        console.log("钱包未连接，不能切换到该标签页");
        return;
      }

      if (await ensureSignature()) {
        setActiveTab(tab);
      }
    },
    [ensureSignature, isConnected, address]
  );

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

            {/* 认购时间 */}
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
                  {idoInfo?.isActive
                    ? t("common.endTime")
                    : t("common.startTime")}
                  :
                </Text>
                <Text fontSize="14px" fontWeight={500} color="#000000">
                  {String(idoInfo?.timeLeft.days || 0).padStart(2, "0")}:
                  {String(idoInfo?.timeLeft.hours || 0).padStart(2, "0")}:
                  {String(idoInfo?.timeLeft.minutes || 0).padStart(2, "0")}:
                  {String(idoInfo?.timeLeft.seconds || 0).padStart(2, "0")}
                </Text>
              </Box>
              {/* 点击参与认购后弹出弹窗，弹窗内容为 Modal 组件 */}
              <Button
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
                disabled={!idoInfo?.isActive}
              >
                {idoInfo?.isActive
                  ? t("common.joinIDO")
                  : t("common.notStarted")}
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
                  onClick={() => handleTabClick(tab.id)}
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
                  {/* DBT 介绍文案 */}
                  <VStack align="stretch" spacing={2}>
                    {/* 第一段：总体介绍 */}
                    <Text color="gray.600" fontSize="12px" lineHeight="20px">
                      {/* {t("common.dbtIntro1")} */}
                      <Text
                        as="span"
                        color="#21C161"
                        fontWeight="bold"
                        mr="4px"
                      >
                        DBT
                      </Text>
                      {t("common.dbtIntro")}
                    </Text>

                    {/* 第二段：D 的介绍 */}
                    <Text color="gray.600" fontSize="12px" lineHeight="20px">
                      <Text
                        as="span"
                        color="#21C161"
                        fontWeight="bold"
                        mr="4px"
                      >
                        D
                      </Text>
                      {t("common.dbtDIntro")}
                    </Text>

                    {/* 第三段：B 的介绍 */}
                    <Text color="gray.600" fontSize="12px" lineHeight="20px">
                      <Text
                        as="span"
                        color="#21C161"
                        fontWeight="bold"
                        mr="4px"
                      >
                        B
                      </Text>
                      {t("common.dbtBIntro")}
                    </Text>

                    {/* 第四段：T 的介绍 */}
                    <Text color="gray.600" fontSize="12px" lineHeight="20px">
                      <Text
                        as="span"
                        color="#21C161"
                        fontWeight="bold"
                        mr="4px"
                      >
                        T
                      </Text>
                      {t("common.dbtTIntro")}
                    </Text>
                  </VStack>
                </Box>
              )}

              {/* 已签名的内容 */}
              {activeTab !== "intro" &&
                hasValidSignature &&
                renderSignedContent(
                  activeTab,
                  !!hasParticipated,
                  participationTime || 0,
                  isWhitelisted
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
