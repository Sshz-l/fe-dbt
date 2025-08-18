"use client";

import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { Menu } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import { useI18n } from "@/i18n/context";
import { ChevronRightIcon } from "@chakra-ui/icons";

import { useSignature, type SignatureData } from "@/hooks/useSignature";
import { useIDOInfo } from "@/hooks/useIdoData";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import headerLogo from "@/assets/img/dbt_logo.png";
import languages from "@/assets/svg/lan.svg";

const LANGUAGE_NAMES = {
  en: "English",
  zh: "简体中文",
  tw: "繁体中文",
  ko: "한국어",
};

export default function Header() {
  const { locale, setLocale, availableLocales, t } = useI18n();
  const [isClient, setIsClient] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  // 使用签名 Hook
  const {
    signForIDOParticipation,
    isLoading: isSigning,
    error: signatureError,
    hasValidSignature,
    clearSignature,
    clearError,
  } = useSignature();

  // 使用网络切换 Hook
  const { isCorrectNetwork, switchToCorrectNetwork, networkName } =
    useNetworkSwitch();

  // 使用 IDO 信息 Hook
  const {
    data: idoInfo,
    isLoading: isIDOInfoLoading,
    error: idoInfoError,
  } = useIDOInfo(isConnected);

  // 签名相关状态
  const [showSignatureTest, setShowSignatureTest] = useState(false);
  const [signatureResult, setSignatureResult] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 自动签名功能
  const handleAutoSignature = useCallback(async () => {
    if (!address) return;

    try {
      setSignatureResult("🔏 正在自动请求签名...");
      clearError();

      const signatureData = await signForIDOParticipation();
      setSignatureResult(
        `✅ 签名成功！\n消息: ${
          signatureData.message
        }\n签名: ${signatureData.signature.slice(0, 20)}...`
      );
      setShowSignatureTest(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      console.error("❌ 自动签名失败:", errorMessage);
      setSignatureResult(`❌ 自动签名失败: ${errorMessage}`);
    }
  }, [address, signForIDOParticipation, clearError]);

  // 监听钱包连接状态，自动触发签名
  useEffect(() => {
    const handleConnection = async () => {
      if (!isConnected || !address) {
        console.log("❌ 钱包未连接");
        setSignatureResult("");
        return;
      }

      // 检查并切换到正确的网络
      if (!isCorrectNetwork) {
        console.log("🔄 检测到网络不匹配，自动切换网络");
        try {
          await switchToCorrectNetwork();
          console.log("✅ 网络切换成功");
          // 网络切换成功后检查签名状态
          if (!hasValidSignature) {
            console.log("🔏 未检测到有效签名，开始签名流程");
            // 延迟2秒等待网络切换完成
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await handleAutoSignature();
          }
        } catch (error) {
          console.error("❌ 网络切换失败:", error);
        }
      } else if (!hasValidSignature) {
        console.log("🔏 未检测到有效签名，开始签名流程");
        await handleAutoSignature();
      }
    };

    handleConnection();
  }, [
    isConnected,
    address,
    isCorrectNetwork,
    hasValidSignature,
    switchToCorrectNetwork,
    handleAutoSignature,
  ]);

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale as "en" | "zh" | "tw" | "ko");
  };

  const handleConnectWallet = () => {
    open();
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setShowSignatureTest(false);
    setSignatureResult("");
    clearSignature();
  };

  // 手动测试签名功能
  const handleTestSignature = async () => {
    if (!address) return;

    try {
      setSignatureResult("🔏 正在重新请求签名...");
      clearError();

      // 创建签名
      const signatureData = await signForIDOParticipation();

      setSignatureResult(
        `✅ 重新签名成功！\n消息: ${
          signatureData.message
        }\n签名: ${signatureData.signature.slice(0, 20)}...`
      );

      // 延迟验证签名
      setTimeout(async () => {
        try {
          // const storedData: StoredSignature = {
          //   address: address || '',
          //   data: signatureData,
          //   expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          // };
          // const isValid = await verifySignatureData(storedData, address);
          // if (isValid) {
          //   setSignatureResult((prev) => prev + "\n🔍 签名验证成功！");
          //   // 自动显示签名测试区域
          //   setShowSignatureTest(true);
          // } else {
          //   setSignatureResult((prev) => prev + "\n❌ 签名验证失败！");
          // }
        } catch (error) {
          setSignatureResult(
            (prev) =>
              prev +
              `\n❌ 验证错误: ${
                error instanceof Error ? error.message : "未知错误"
              }`
          );
        }
      }, 1000);
    } catch (error) {
      setSignatureResult(
        `❌ 重新签名失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  };

  if (!isClient) {
    return (
      <Box as="header" borderBottom="3px solid #fff" p="20px" pb="0px">
        <Box
          fontWeight="bold"
          color="white"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Image src={headerLogo.src} alt="DBT Logo" h="24px" w="auto" />
          <Text fontSize="18px" color={"#141414"}>
            DBT
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box as="header" p="20px" pb="0px">
      <Flex justify="space-between" align="center">
        {/* Logo */}
        <Box
          fontWeight="bold"
          color="white"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Image src={headerLogo.src} alt="DBT Logo" h="24px" w="auto" />
          <Text fontSize="18px" color={"#141414"}>
            DBT
          </Text>
        </Box>

        {/* Language Selector */}
        <Flex position="relative" gap={3}>
          {/* 网络信息显示 */}
          {isConnected && (
            <Box
              px={3}
              py={2}
              bg={isCorrectNetwork ? "green.100" : "orange.100"}
              border="1px solid"
              borderColor={isCorrectNetwork ? "green.300" : "orange.300"}
              borderRadius="md"
              fontSize="12px"
              fontWeight="medium"
              color={isCorrectNetwork ? "green.700" : "orange.700"}
            >
              <Text>
                {isCorrectNetwork ? "✅" : "⚠️"} {networkName}
              </Text>
              {!isCorrectNetwork && (
                <Text fontSize="10px" color="orange.600">
                  点击切换网络
                </Text>
              )}
            </Box>
          )}

          <Menu.Root>
            <Menu.Trigger
              style={{ outline: "none" }}
              _focus={{ outline: "none" }}
              _focusVisible={{ outline: "none" }}
            >
              <Flex
                align="center"
                gap={2}
                cursor="pointer"
                bg="rgba(255, 255, 255, 0.1)"
                borderRadius="md"
                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                transition="all 0.2s"
                _focus={{ outline: "none", boxShadow: "none" }}
                _focusVisible={{ outline: "none", boxShadow: "none" }}
                _active={{ outline: "none", boxShadow: "none" }}
                _selected={{ outline: "none", boxShadow: "none" }}
                _expanded={{ outline: "none", boxShadow: "none" }}
                border="none"
                outline="none"
                style={{ outline: "none" }}
              >
                <Box fontSize="16px" color="white">
                  <Image
                    src={languages.src}
                    alt="Language Icon"
                    h="24px"
                    w="24px"
                    style={{ outline: "none" }}
                  />
                </Box>
              </Flex>
            </Menu.Trigger>
            <Menu.Content
              position="absolute"
              top="100%"
              left={0}
              mt={2}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              p={0}
              minW="160px"
              boxShadow="xl"
              zIndex={1000}
              _before={{
                content: '""',
                position: "absolute",
                top: "-8px",
                right: "20px",
                width: "0",
                height: "0",
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: "8px solid white",
              }}
            >
              {availableLocales.map((lang) => (
                <Menu.Item
                  key={lang}
                  value={lang}
                  onClick={() => handleLanguageChange(lang)}
                  bg="transparent"
                  color="gray.800"
                  fontSize="14px"
                  fontWeight="medium"
                  _hover={{ bg: "gray.50" }}
                  _active={{ bg: "gray.100" }}
                  borderBottom={
                    lang === availableLocales[availableLocales.length - 1]
                      ? "none"
                      : "1px solid"
                  }
                  borderBottomColor="gray.100"
                  py={3}
                  px={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _focus={{ outline: "none" }}
                  _focusVisible={{ outline: "none" }}
                >
                  <Flex justify="space-between" align="center" w="full">
                    <Text>{LANGUAGE_NAMES[lang]}</Text>
                    {locale === lang && (
                      <Box color="green.500" fontSize="16px">
                        ✓
                      </Box>
                    )}
                  </Flex>
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Root>

          {/* Wallet Connect Button */}
          {!isConnected ? (
            <Button
              onClick={handleConnectWallet}
              colorScheme="green"
              size="sm"
              bg="#21C161"
              _hover={{ bg: "#21C161", opacity: 0.8 }}
              _active={{ bg: "#21C161", opacity: 0.8 }}
              border="1px solid"
              borderColor="#21C161"
              fontSize="14px"
              fontWeight="medium"
              color="white"
              borderRadius="8px"
            >
              {t("common.connect")}
              <ChevronRightIcon />
            </Button>
          ) : (
            <Menu.Root>
              <Menu.Trigger>
                <Box
                  as="div"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  px={3}
                  py={2}
                  bg="#21C161"
                  _hover={{ bg: "#21C161", opacity: 0.8 }}
                  _active={{ bg: "#21C161", opacity: 0.8 }}
                  border="1px solid"
                  borderColor="#21C161"
                  fontSize="14px"
                  fontWeight="medium"
                  color="white"
                  borderRadius="8px"
                  cursor="pointer"
                  transition="all 0.2s"
                >
                  <HStack gap={0}>
                    <Text color="white">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </Text>
                    {/* <Box fontSize="12px" color="white" ml='4px'>
                      <Text>→</Text>
                    </Box> */}
                  </HStack>
                </Box>
              </Menu.Trigger>
              <Menu.Content
                position="absolute"
                top="100%"
                right={0}
                mt={2}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                p={0}
                minW="200px"
                boxShadow="xl"
                zIndex={1000}
                _before={{
                  content: '""',
                  position: "absolute",
                  top: "-8px",
                  right: "20px",
                  width: "0",
                  height: "0",
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "8px solid white",
                }}
              >
                {/* 签名测试按钮 */}
                {/* <Menu.Item
                  value="signature-test"
                  onClick={() => setShowSignatureTest(!showSignatureTest)}
                  bg="transparent"
                  color="blue.600"
                  fontSize="14px"
                  fontWeight="medium"
                  _hover={{ bg: "blue.50" }}
                  _active={{ bg: "blue.100" }}
                  py={3}
                  px={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _focus={{ outline: "none" }}
                  _focusVisible={{ outline: "none" }}
                >
                  <Flex align="center" gap={2}>
                    <Text>🔏 测试签名</Text>
                  </Flex>
                </Menu.Item> */}

                {/* 断开连接按钮 */}
                <Menu.Item
                  value="disconnect"
                  onClick={handleDisconnectWallet}
                  bg="transparent"
                  color="red.600"
                  fontSize="14px"
                  fontWeight="medium"
                  _hover={{ bg: "red.50" }}
                  _active={{ bg: "red.100" }}
                  py={3}
                  px={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _focus={{ outline: "none" }}
                  _focusVisible={{ outline: "none" }}
                >
                  <Flex align="center" gap={2}>
                    <Text>{t("common.disconnect")}</Text>
                  </Flex>
                </Menu.Item>
              </Menu.Content>
            </Menu.Root>
          )}
        </Flex>
      </Flex>

    </Box>
  );
}
