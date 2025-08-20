"use client";
export const runtime = "edge";

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
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { useEffect, useState, useCallback } from "react";
// import { ethers } from "ethers";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

import { useWalletStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";
import bgShare from "@/assets/img/share_bg.png";
import shareImg from "@/assets/img/share.png";
import copyIcon from "@/assets/img/dbt_copy.png";
import mintIcon from "@/assets/img/mint.png";
import { useReferralStats } from "@/hooks/useIdoData";
import idoAbi from "@/abis/ido.json";
import { getContractAddress } from "@/config/networks";
import { useI18n } from "@/i18n/context";

export default function Home() {
  const { t } = useI18n();
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { setAccount, setBalance } = useWalletStore();
  const router = useRouter();
  console.log("isConnected", isConnected);
  const { data: referralStats, refetch: refetchReferralStats } = useReferralStats(address);
  const { writeContractAsync } = useWriteContract();
  const [isMinting, setIsMinting] = useState(false);
  
  const inviteLink = `${process.env.NEXT_PUBLIC_API_BASE_URL}?ref=${address}`;
  const { onCopy, hasCopied } = useClipboard(inviteLink);

  useEffect(() => {
    if (hasCopied) {
      toast.success({
        title: t("common.copySuccess"),
        description: t("common.copySuccessDesc"),
      });
    }
  }, [hasCopied, t, toast]);

  // useEffect(() => {
  //   if (isConnected && address) {
  //     setAccount(address);
  //     // if (balanceData) {
  //     //   const formattedBalance = ethers.formatEther(balanceData.value);
  //     //   setBalance(formattedBalance);
  //     // }
  //   } else {
  //     setAccount(null);
  //     setBalance("0");
  //   }
  // }, [isConnected, address, balanceData, setAccount, setBalance]);

  // 处理铸造 NFT
  const handleMint = useCallback(async () => {
    try {
      setIsMinting(true);
      // 调用 claimSBT 铸造 NFT
      const hash = await writeContractAsync({
        address: getContractAddress(),
        abi: idoAbi,
        functionName: 'claimSBT',
        args: [],
      });

      if (!hash) {
        // 用户取消了交易
        return;
      }

      // 等待交易被确认（通过 SBTMinted 事件）
      const waitForMint = new Promise<void>((resolve) => {
        const timer = setInterval(async () => {
          // 尝试刷新数据
          const newStats = await refetchReferralStats();
          // 如果数据有更新（sbtsClaimable 减少，sbtsMinted 增加），说明铸造成功
          if (
            newStats.data &&
            referralStats &&
            newStats.data.sbtsClaimable < referralStats.sbtsClaimable &&
            newStats.data.sbtsMinted > referralStats.sbtsMinted
          ) {
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

      // 显示等待提示
      toast.info({
        title: t("common.minting"),
        description: t("common.waitingBlockConfirm"),
      });

      // 等待铸造完成
      await waitForMint;

      // 显示成功提示
      toast.success({
        title: t("common.mintSuccess"),
        description: `${t("common.mintSuccessDesc")} ${hash}`,
      });

    } catch (error) {
      toast.error({
        title: t("common.mintFailed"),
        description: error instanceof Error ? error.message : t("common.mintFailedDesc"),
      });
    } finally {
      setIsMinting(false);
    }
  }, [writeContractAsync, toast, t, refetchReferralStats, referralStats]);

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
            {t("common.share")}
          </Text>
        </Flex>
        <VStack align="stretch" gap={4} mt="20px">
          {/* 邀請好友，賺取手續費 */}
          <Center>
            <Text fontSize="24px" fontWeight={900} color="#21C161">
              {t("common.inviteFriendFee")}
            </Text>
          </Center>
          {/* 推薦好友認購 DBT 生態協議代幣，受邀好友完成認購後，您可獲得價值 1320 USDT 的手續費分紅 */}
          <Box
            fontSize="14px"
            fontWeight={400}
            color="#000000"
            textAlign={"center"}
          >
            {t("common.recommend")}
            <Text as="span" color="#21C161" ml="2px" mr="2px">
              {t("common.dbt")}
            </Text>
            {t("common.recommendDesc2")}
            <Text as="span" color="#21C161" ml="2px" mr="2px">
              1320 USDT
            </Text>
            {t("common.recommendDesc3")}
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
            {t("common.feeRule")}
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
            <Flex justifyContent={"space-around"} gap="16px" alignItems={"center"}>
              <Box textAlign={"center"}>
                <Text fontSize="18px" fontWeight={600}>
                  {referralStats?.referralCount}
                </Text>
                <Text fontSize="12px" fontWeight={400}>
                  {t("common.successRecommend")}
                </Text>
              </Box>
              <Box textAlign={"center"}>
                <Text fontSize="18px" fontWeight={600}>
                  {referralStats?.sbtsMinted}
                </Text>
                <Text fontSize="12px" fontWeight={400}>
                  {t("common.mintedNFT")}
                </Text>
              </Box>
              <Box textAlign={"center"}>
                <Text fontSize="18px" fontWeight={600}>
                  {/* // TODO: 调用getReferralStats获取待铸造NFT数量 */}
                  {referralStats?.sbtsClaimable}
                </Text>
                <Text fontSize="12px" fontWeight={400}>
                  {t("common.pendingMintNFT")}
                </Text>
              </Box>
            </Flex>
            <Button
              w="100%"
              bg="#21C161"
              color="white"
              borderRadius="16px"
              disabled={referralStats?.sbtsClaimable === 0 || isMinting}
              isLoading={isMinting}
              _hover={{ bg: "#21C161", opacity: 0.8 }}
              _active={{ bg: "#21C161", opacity: 0.8 }}
              onClick={handleMint}
            >
              <Image src={mintIcon.src} alt="mint" w="16px" h="16px" mr="2" />
              {referralStats?.sbtsClaimable === 0 ? t("common.noMintPermission") : t("common.confirmMint")}
            </Button>
            {/* 邀请链接 链接超出...  保持一行 */}
            <Flex justifyContent={"space-between"} alignItems={"center"}>
              <Text>{t("common.inviteLink")}：</Text>
              <Text
                // whiteSpace={"nowrap"}
                // overflow={"hidden"}
                // textOverflow={"ellipsis"}
                maxW="200px"
                textOverflow={"ellipsis"}
                overflow={"hidden"}
                whiteSpace={"nowrap" as const}
              >
                {/* 通过配置里面取域名加ref，ref为当前连接的钱包地址 */}
                {`${process.env.NEXT_PUBLIC_API_BASE_URL}?ref=${address}`}
              </Text>
              {/* 复制图标， 点击后复制 */}
              <Image
                src={copyIcon.src}
                alt="copy"
                w="16px"
                h="16px"
                onClick={onCopy}
                cursor="pointer"
              />
            </Flex>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
}
