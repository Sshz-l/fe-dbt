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
} from "@chakra-ui/react";
import { useAccount, useBalance } from "wagmi";
import { useEffect, useState } from "react";
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
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { useWhitelistLevel } from "@/hooks/useIdoData";

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

  // 使用网络切换 Hook
  const {
    currentChainId,
    targetChainId,
    isCorrectNetwork,
    networkName,
    networkConfig,
  } = useNetworkSwitch();

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 2,
    seconds: 31,
    milliseconds: 32,
  });
  const [activeTab, setActiveTab] = useState("recommended"); // 添加标签页状态
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // 使用 IDO 信息 Hook
  const {
    data: idoInfo,
    isLoading: isIDOInfoLoading,
    error: idoInfoError,
  } = useIDOInfo();

  // 获取白名单等级
  const { data: whitelistInfo } = useWhitelistLevel(isConnected);
  const isWhitelisted = whitelistInfo?.isWhitelisted ?? false;

  // 定义标签页配置
  const tabs = [
    { id: "intro", label: "项目介绍" },
    { id: "my", label: "我的认购" },
    { id: "invites", label: "邀请记录" },
    ...(isWhitelisted ? [{ id: "recommended", label: "推荐认购" }] : []),
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

  // 如果当前选中的是推荐认购标签，但用户不是白名单用户，则切换到项目介绍
  useEffect(() => {
    if (!isWhitelisted && activeTab === "recommended") {
      setActiveTab("intro");
    }
  }, [isWhitelisted, activeTab]);

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
                  进行中
                </Badge>
              </Flex>
              <Box>
                <Text fontSize="18px" fontWeight="bold" color="gray.800">
                  DBT Ecological Protocol Token
                </Text>
                <Text color="#000000" fontSize="12px" fontWeight={400} mt={2}>
                  DeBoxS的首个生态协议代币
                </Text>
              </Box>
              <Flex direction={"column"} gap={2} mt={4}>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    IDO价格:
                  </Text>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    1DBT=0.066USDT
                  </Text>
                </Flex>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    上线开盘价格:
                  </Text>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    1DBT=0.2USDT
                  </Text>
                </Flex>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  <Text fontSize="12px" fontWeight={400} color="#000000">
                    最低认购金额:
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
                  认购结束时间:
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
                onClick={() => setIsSubscriptionModalOpen(true)}
              >
                参与认购
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
                    邀请好友赚手续费
                  </Text>
                  <Text color="#333333" fontSize="12px" fontWeight="600">
                    价值
                    <Text as="span" color="#21C161" mx="2px">
                      1320USDT
                    </Text>
                    的手续费分红
                  </Text>
                </VStack>
              </HStack>
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
                onClick={() => router.push("/share")}
                // disabled={!isWhitelisted}
              >
                {t("common.inviteFriend")}
                {/* {isWhitelisted ? t("common.inviteFriend") : "暂无邀请权限"} */}
              </Button>
            </Flex>
          </Box>

          {/* 底部：标签页 */}
          <Box bg="white">
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
                  onClick={() => setActiveTab(tab.id)}
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
                  <Text color="gray.600" fontSize="12px" lineHeight="20px">
                    DBT是基于DeBox生态的首个去中心化协议。 D代表 Destroy
                    Building
                    ，代表销毁即建设，通过公平、去中心化的方式分配生态所产生的价值，在链上永久自主运行。
                    B代表Builders
                    Reward，代表建设者激励，建设者是生态的核心，为生态创造价值的同时也分享生态产生的奖励。
                    T代表Token Deflation,
                    代表销毁通缩机制，DBT独特的销毁铸造经济模型，帮助实现代币快速通缩和生态的可持续增长。
                  </Text>
                </Box>
              )}

              {activeTab === "my" && (
                <Box
                  bg="white"
                  p="16px"
                  border="1px solid"
                  borderColor="#0000001A"
                >
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
                        认购 5000DBT
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
                </Box>
              )}

              {/* 邀请记录内容显示的列表和推荐认购列表一样 */}
              {activeTab === "invites" && (
                <Box
                  bg="white"
                  p="16px"
                  border="1px solid"
                  borderColor="#0000001A"
                >
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
                      >
                        领取
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </VStack>
      </Box>
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onConfirm={() => {}}
      />
    </WidthLayout>
  );
}
