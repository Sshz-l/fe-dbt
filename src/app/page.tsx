"use client";

import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Center,
  Flex,
  Image,
} from "@chakra-ui/react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWalletStore } from "@/store/useStore";
import { appKitModal } from "@/app/providers";
import WidthLayout from "@/components/WidthLayout";
import { Header } from "@/components/Header";
import { useI18n } from "@/i18n/context";
import { useRouter } from "next/navigation";
import logo from "@/assets/img/dbt_logo.png";
import px2vw from "@/utils/px2vw";
import rewardLogo from "@/assets/img/reward.png";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { account, balance, setAccount, setBalance } = useWalletStore();
  const { disconnect } = useDisconnect();
  const { t } = useI18n();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 2,
    seconds: 31,
    milliseconds: 32,
  });
  const [activeTab, setActiveTab] = useState("recommended"); // 添加标签页状态

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

  const handleConnect = () => {
    appKitModal.open();
  };

  const handleDisconnect = () => {
    disconnect();
    setAccount(null);
    setBalance("0");
  };

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
      <Box
        px={{ base: px2vw(80), lg: "40px" }}
        py={{ base: px2vw(40), lg: "20px" }}
        maxW="container.sm"
        mx="auto"
      >
        <VStack gap={6} align="stretch">
          {/* 顶部：代币信息和认购详情 */}
          <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
            {/* 状态指示器 */}
            <Flex justify="space-between" align="start" mb={4}>
              <Box flex={1}>
                {/* 代币Logo */}
                <Image src={logo.src} alt="DBT" w="52px" h="52px" />

                {/* 代币名称和描述 */}
                <Heading size="lg" mb={2} color="gray.800">
                  DBT Ecological Protocol Token
                </Heading>
                <Text color="gray.600" fontSize="sm" mb={4}>
                  DeBoxS的首个生态协议代币
                </Text>

                {/* 价格信息 */}
                <VStack align="start" gap={2} mb={4}>
                  <Text fontSize="sm" color="gray.700">
                    <Text as="span" fontWeight="bold">
                      IDO价格:
                    </Text>{" "}
                    1DBT=0.066USDT
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    <Text as="span" fontWeight="bold">
                      上线开盘价格:
                    </Text>{" "}
                    1DBT=0.2USDT
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    <Text as="span" fontWeight="bold">
                      最低认购金额:
                    </Text>{" "}
                    330USDT/5000DBT
                  </Text>
                </VStack>
              </Box>

              {/* 右侧状态和倒计时 */}
              <VStack align="end" gap={4}>
                <Badge
                  colorScheme="green"
                  variant="solid"
                  px={3}
                  py={1}
                  borderRadius="md"
                >
                  进行中
                </Badge>

                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    认购结束时间:
                  </Text>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="gray.800"
                    fontFamily="mono"
                  >
                    {String(timeLeft.hours).padStart(2, "0")}:
                    {String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}:
                    {String(timeLeft.milliseconds).padStart(2, "0")}
                  </Text>
                </Box>

                <Button colorScheme="green" size="md" borderRadius="md">
                  参与认购
                </Button>
              </VStack>
            </Flex>
          </Box>

          {/* 中部：推荐奖励系统 */}
          <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
            <Flex justify="space-between" align="center">
              <HStack gap={3}>
                <Image src={rewardLogo.src} alt="reward" w="42px" h="42px" />
                <VStack align="start" gap={1}>
                  <Text color="green.500" fontWeight="bold" fontSize="14px">
                    邀请好友赚手续费
                  </Text>
                  <Text color="green.500" fontSize="12px">
                    价值1320USDT的手续费分红
                  </Text>
                </VStack>
              </HStack>
              <Button colorScheme="green" size="md" borderRadius="md" bg="#21C161" color="white" _hover={{ bg: "#21C161", opacity: 0.8 }} _active={{ bg: "#21C161", opacity: 0.8 }} border="1px solid" borderColor="#21C161">
                邀请好友
              </Button>
            </Flex>
          </Box>

          {/* 底部：认购历史和推荐认购 */}
          <Box bg="white" borderRadius="xl" boxShadow="sm">
            {/* 标签页导航 */}
            <HStack gap={0} borderBottom="1px solid" borderColor="gray.200">
              <Box
                px={4}
                py={3}
                cursor="pointer"
                borderBottom={activeTab === "intro" ? "2px solid" : "none"}
                borderColor="black"
                fontWeight={activeTab === "intro" ? "bold" : "normal"}
                onClick={() => setActiveTab("intro")}
                _hover={{ bg: "gray.50" }}
              >
                项目介绍
              </Box>
              <Box
                px={4}
                py={3}
                cursor="pointer"
                borderBottom={activeTab === "my" ? "2px solid" : "none"}
                borderColor="black"
                fontWeight={activeTab === "my" ? "bold" : "normal"}
                onClick={() => setActiveTab("my")}
                _hover={{ bg: "gray.50" }}
              >
                我的认购
              </Box>
              <Box
                px={4}
                py={3}
                cursor="pointer"
                borderBottom={
                  activeTab === "recommended" ? "2px solid" : "none"
                }
                borderColor="black"
                fontWeight={activeTab === "recommended" ? "bold" : "normal"}
                onClick={() => setActiveTab("recommended")}
                _hover={{ bg: "gray.50" }}
              >
                推荐认购
              </Box>
            </HStack>

            {/* 标签页内容 */}
            <Box p={6}>
              {activeTab === "intro" && (
                <Text color="gray.600">项目介绍内容...</Text>
              )}

              {activeTab === "my" && (
                <Text color="gray.600">我的认购内容...</Text>
              )}

              {activeTab === "recommended" && (
                <Box>
                  {/* 列表头部 */}
                  <HStack
                    bg="gray.50"
                    p={3}
                    borderRadius="md"
                    mb={3}
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="medium"
                  >
                    <Box flex={1}>钱包地址</Box>
                    <Box flex={1}>认购时间</Box>
                    <Box flex={1}>认购金额</Box>
                  </HStack>

                  {/* 认购列表 */}
                  <VStack gap={2}>
                    {subscriptionData.map((item, index) => (
                      <Box key={index} w="full">
                        <HStack
                          p={3}
                          bg="white"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.100"
                          _hover={{ bg: "gray.50" }}
                          transition="all 0.2s"
                        >
                          <Box flex={1} fontSize="sm" color="gray.800">
                            {item.address}
                          </Box>
                          <Box flex={1} fontSize="sm" color="gray.800">
                            {item.time}
                          </Box>
                          <Box flex={1} fontSize="sm" color="gray.800">
                            {item.amount}
                            {/* <HStack gap={2}>
                              <Text>{item.amount}</Text>
                              {index === 1 && (
                                <Box
                                  w="24px"
                                  h="24px"
                                  bg="blue.400"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  color="white"
                                  fontSize="xs"
                                >
                                  👤
                                </Box>
                              )}
                            </HStack> */}
                          </Box>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>

                  {/* 待领取部分 */}
                  <Box mt={6} p={4} bg="gray.50" borderRadius="md">
                    <Flex justify="space-between" align="center">
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" color="gray.600">
                          待领取
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.500"
                        >
                          88888UDT
                        </Text>
                      </VStack>
                      <Button colorScheme="green" size="md" borderRadius="md">
                        领取
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* 钱包连接状态 */}
          {!isConnected && (
            <Box
              bg="white"
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              textAlign="center"
            >
              <Text color="gray.600" mb={4}>
                连接钱包以参与认购
              </Text>
              <Button colorScheme="blue" size="lg" onClick={handleConnect}>
                连接钱包
              </Button>
            </Box>
          )}

          {/* 导航到DBT页面 */}
          <Box textAlign="center">
            <Button
              onClick={() => router.push("/dbt")}
              colorScheme="purple"
              size="md"
              variant="outline"
            >
              前往DBT钱包
            </Button>
          </Box>
        </VStack>
      </Box>
    </WidthLayout>
  );
}
