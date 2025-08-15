"use client";

import { Box, Flex, Text, Image, Button, HStack } from "@chakra-ui/react";
import { Menu } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { ChevronRightIcon } from "@chakra-ui/icons";

import headerLogo from "@/assets/img/dbt_logo.png";
import languages from "@/assets/svg/lan.svg";
import { useAccount, useDisconnect } from "wagmi";
import { useI18n } from "@/i18n/context";

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
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale as "en" | "zh" | "tw" | "ko");
  };

  const handleConnectWallet = () => {
    open();
  };

  const handleDisconnectWallet = () => {
    disconnect();
  };

  if (!isClient) {
    return (
      <Box
        as="header"
        borderBottom="3px solid #fff"
        p='20px'
        pb='0px'
      >
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
    <Box
      as="header"
      p='20px'
      pb='0px'
    >
      <Flex justify="space-between" align="center">
        {/* Logo - 使用文本替代 */}
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
                // px={3}
                // py={2}
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
                {/* <Box fontSize="14px" color="white"> */}
                {/* {LANGUAGE_NAMES[locale]} */}
                {/* </Box> */}
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
              <ChevronRightIcon color="white" />
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
                    {/* <Box fontSize="16px">🔌</Box> */}
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
};
