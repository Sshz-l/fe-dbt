"use client";

import {
  Box,
  Button,
  Text,
  VStack,
  Center,
  Flex,
  Image,
  useClipboard,
} from "@chakra-ui/react";
import { useAccount, useBalance } from "wagmi";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

import { useWalletStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";
import { useWhitelistLevel } from "@/hooks/useIdoData";
import bgShare from "@/assets/img/share_bg.png";
import shareImg from "@/assets/img/share.png";
import copyIcon from "@/assets/img/dbt_copy.png";
import mintIcon from "@/assets/img/mint.png";

export default function Home() {
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { setAccount, setBalance } = useWalletStore();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  console.log("isConnected", isConnected);

  // 获取白名单等级
  const { data: whitelistInfo, isLoading: isWhitelistLoading } = useWhitelistLevel(isConnected);
  const showRecommendation = whitelistInfo?.isWhitelisted ?? false;

  const { copy } = useClipboard({
    value:
      "https://destroybuild.finance?ref=0x802E5eDBC15100AFCEd0f2361Ec37b2a00FceE88",
  });

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

  if (!isClient) {
    return (
      <Center p={8} maxW="md" mx="auto">
        <VStack gap={6} align="stretch">
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  // 如果未连接钱包或不是白名单用户，显示提示
  // if (isClient && (!isConnected || !showRecommendation)) {
  //   return (
  //     <Center p={8} maxW="md" mx="auto">
  //       <VStack gap={6} align="stretch">
  //         <Text textAlign="center" color="red.500">
  //           {!isConnected ? "请先连接钱包" : "您暂无推荐权限"}
  //         </Text>
  //         {isConnected && (
  //           <Text textAlign="center" fontSize="sm" color="gray.500">
  //             当前白名单等级: {whitelistInfo?.level ?? 0}
  //           </Text>
  //         )}
  //         <Button onClick={() => router.back()}>返回</Button>
  //       </VStack>
  //     </Center>
  //   );
  // }

  return (
    <Box
      bg={`url(${bgShare.src})`}
      bgSize="100%"
      bgPos="top center"
      bgRepeat="no-repeat"
      w={{ base: "100%", md: "420px" }} // Example width logic
      mx="auto" // Center the layout
      // boxShadow="0 4px 20px rgba(85 238 255)"
      minH={"100vh"}
      // bg="linear-gradient(to bottom, #FFFFFF, #FFFFFF)"
      className="scrollable-content"
    >
      <Box p="20px" maxW="100%" mx="auto">
        {/* <Text>{isConnected ? "已连接" : "未连接"}</Text> */}
        {/* 邀请好友居中，左箭头居左 */}
        <Flex alignItems="center" position="relative" py="10px">
          <Box position="absolute" left="10px" onClick={() => router.back()}>
            <ChevronLeftIcon w="30px" h="30px" cursor="pointer" />
          </Box>
          <Text flex="1" textAlign="center" fontSize="20px" fontWeight={500}>
            邀请好友
          </Text>
        </Flex>
        <VStack align="stretch" gap={4} mt="20px">
          {/* 邀請好友，賺取手續費 */}
          <Center>
            <Text fontSize="30px" fontWeight={900} color="#21C161">
              邀請好友，賺取手續費
            </Text>
          </Center>
          {/* 推薦好友認購 DBT 生態協議代幣，受邀好友完成認購後，您可獲得價值 1320 USDT 的手續費分紅 */}
          <Box
            fontSize="15px"
            fontWeight={500}
            color="#000000"
            textAlign={"center"}
          >
            推薦好友認購
            <Text as="span" color="#21C161" ml="2px" mr="2px">
              DBT 生態協議代幣
            </Text>
            ，受邀好友完成認購後，您可獲得價值
            <Text as="span" color="#21C161" ml="2px" mr="2px">
              1320 USDT
            </Text>
            的手續費分紅
          </Box>
          {/* 手续费规则按钮 */}
          <Button
            w="120px"
            bg="white"
            color="rgba(0, 0, 0, 1)"
            borderRadius="16px"
            border="1px solid rgba(0, 0, 0, 0.1)"
            fontSize="14px"
            fontWeight={400}
            _hover={{ bg: "white", opacity: 0.8 }}
            _active={{ bg: "white", opacity: 0.8 }}
            m="26px auto"
            mb={0}
          >
            手续费规则
          </Button>
          <Center>
            <Image src={shareImg.src} alt="share" w="100%" h="100%" />
          </Center>
          {/* 确认铸造模块 */}
          <Flex
            bg="white"
            p="16px"
            border="1px solid"
            borderColor="rgba(0, 0, 0, 0.1)"
            borderRadius="16px"
            fontSize="12px"
            flexDirection={"column"}
            gap="16px"
            mt="20px"
          >
            <Flex justifyContent={"space-between"}>
              <Box textAlign={"center"}>
                <Text fontSize="18px" fontWeight={600}>
                  {whitelistInfo?.level ?? 0}
                </Text>
                <Text fontSize="12px" fontWeight={400}>
                  白名单等级
                </Text>
              </Box>
              <Box textAlign={"center"}>
                <Text fontSize="18px" fontWeight={600}>
                  30
                </Text>
                <Text fontSize="12px" fontWeight={400}>
                  已铸造NFT数量
                </Text>
              </Box>
              <Box textAlign={"center"}>
                <Text fontSize="18px" fontWeight={600}>
                  30
                </Text>
                <Text fontSize="12px" fontWeight={400}>
                  未铸造NFT数量
                </Text>
              </Box>
            </Flex>
            <Button
              w="100%"
              bg="#21C161"
              color="white"
              borderRadius="16px"
              disabled={!showRecommendation}
              _hover={{ bg: "#21C161", opacity: 0.8 }}
              _active={{ bg: "#21C161", opacity: 0.8 }}
            >
              <Image src={mintIcon.src} alt="mint" w="16px" h="16px" mr="2" />
              {showRecommendation ? "确认铸造" : "暂无铸造权限"}
            </Button>
            {/* 邀请链接 链接超出...  保持一行 */}
            <Flex justifyContent={"space-between"} alignItems={"center"}>
              <Text>邀请链接：</Text>
              <Text
                // whiteSpace={"nowrap"}
                // overflow={"hidden"}
                // textOverflow={"ellipsis"}
                maxW="200px"
                textOverflow={"ellipsis"}
                overflow={"hidden"}
                whiteSpace={"nowrap" as const}
              >
                https://destroybuild.finance?ref=0x802E5eDBC15100AFCEd0f2361Ec37b2a00FceE88
              </Text>
              {/* 复制图标， 点击后复制 */}
              <Image
                src={copyIcon.src}
                alt="copy"
                w="16px"
                h="16px"
                onClick={() => {
                  // 使用chakra-ui的复制功能
                  copy();
                  toast.success({
                    title: "复制成功",
                    description: "邀请链接已复制到剪贴板",
                  });
                }}
                cursor={"pointer"}
              />
            </Flex>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
}
