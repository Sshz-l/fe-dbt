"use client";

import {
  Box,
  Button,
  Text,
  Image,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useEffect, useState, useRef } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import { useI18n } from "@/i18n/context";
import { type Locale, localeNames } from "@/i18n/config";
import { useSignature } from "@/hooks/useSignature";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import headerLogo from "@/assets/img/dbt_logo.png";
import languages from "@/assets/svg/lan.svg";

export default function Header() {
  const { locale, setLocale, availableLocales, t } = useI18n();
  const [isClient, setIsClient] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  // 使用签名 Hook
  const { hasValidSignature, hasRejectedSignature, signForIDOParticipation } = useSignature();

  // 使用网络切换 Hook
  const { isCorrectNetwork, switchToCorrectNetwork, networkName } = useNetworkSwitch();

  // 处理连接状态的 ref，避免重复处理
  const connectionHandledRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 监听钱包连接状态，处理网络切换和签名
  useEffect(() => {
    let isProcessing = false;

    const handleWalletConnection = async () => {
      // 如果已经处理过、钱包未连接、正在处理中或已拒绝签名，直接返回
      if (
        connectionHandledRef.current ||
        !isConnected ||
        !address ||
        isProcessing ||
        hasRejectedSignature
      ) {
        return;
      }

      try {
        isProcessing = true;
        console.log('开始处理钱包连接...');

        // 1. 检查网络状态
        if (!isCorrectNetwork) {
          console.log('检测到网络不正确，准备切换网络...');
          try {
            await switchToCorrectNetwork();
            console.log('网络切换请求已发送，等待确认...');
            return;
          } catch (error) {
            console.error('切换网络失败:', error);
            return;
          }
        }

        // 2. 网络正确，检查签名状态
        console.log('网络正确，检查签名状态...');
        if (!hasValidSignature && !hasRejectedSignature) {
          console.log('未检测到有效签名，准备请求签名...');
          try {
            await signForIDOParticipation();
            console.log('签名完成');
            connectionHandledRef.current = true;
          } catch (error) {
            console.error('签名失败:', error);
            disconnect();
          }
        } else {
          console.log(hasValidSignature ? '已有有效签名' : '用户已拒绝签名');
          connectionHandledRef.current = true;
        }
      } finally {
        isProcessing = false;
      }
    };

    handleWalletConnection();

    // 断开连接时重置状态
    if (!isConnected) {
      connectionHandledRef.current = false;
    }

    return () => {
      isProcessing = false;
    };
  }, [
    isConnected,
    address,
    isCorrectNetwork,
    hasValidSignature,
    hasRejectedSignature,
    switchToCorrectNetwork,
    signForIDOParticipation,
    disconnect,
  ]);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const handleConnectWallet = () => {
    open();
  };

  const handleDisconnectWallet = () => {
    disconnect();
  };

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

        {/* Language Selector and Wallet */}
        <Flex position="relative" gap={3} alignItems="center">
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
              onClick={!isCorrectNetwork ? switchToCorrectNetwork : undefined}
              cursor={!isCorrectNetwork ? "pointer" : "default"}
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

          {/* Language Menu */}
          <Menu placement="bottom">
            <MenuButton
              as={Box}
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
                border="none"
                outline="none"
              >
                <Box fontSize="16px" color="white">
                  <Image
                    src={languages.src}
                    alt="Language Icon"
                    h="24px"
                    w="24px"
                  />
                </Box>
              </Flex>
            </MenuButton>
            <MenuList
              mt={2}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              p={0}
              minW="160px"
              boxShadow="xl"
              zIndex={1000}
            >
              {availableLocales.map((lang) => (
                <MenuItem
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
                  <HStack justify="space-between" align="center" w="full">
                    <Text>{localeNames[lang]}</Text>
                    {locale === lang && (
                      <Box color="green.500" fontSize="16px">
                        ✓
                      </Box>
                    )}
                  </HStack>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

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
            <Menu placement="bottom-end">
              <MenuButton
                as={Box}
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
                </HStack>
              </MenuButton>
              <MenuList
                mt={2}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                p={0}
                minW="160px"
                boxShadow="xl"
                zIndex={1000}
              >
                <MenuItem
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
                  <HStack align="center" gap={2}>
                    <Text>{t("common.disconnect")}</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
