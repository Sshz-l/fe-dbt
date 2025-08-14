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
} from "@chakra-ui/react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWalletStore } from "@/store/useStore";
import { appKitModal } from "@/app/providers";
import WidthLayout from "@/components/WidthLayout";
import { Header } from "@/components/Header";
import { useI18n } from '@/i18n/context';
import { useRouter } from "next/navigation";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { account, balance, setAccount, setBalance } = useWalletStore();
  const { disconnect } = useDisconnect();
  const { t } = useI18n();
  const router = useRouter();
  // Use state to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Mark as client-side after mount
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

  // Handle wallet connection using AppKit
  const handleConnect = () => {
    appKitModal.open();
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnect();
    setAccount(null);
    setBalance("0");
  };

  // Render nothing or a fallback during SSR
  if (!isClient) {
    return (
      <Center p={8} maxW="md" mx="auto">
        <VStack gap={6} align="stretch">
          {/* <Heading>Web Wallet</Heading> */}
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <WidthLayout>
      <Header />
      <Box p={8} maxW="md" mx="auto">
        <VStack gap={6} align="stretch">
          <Heading>{t('header.logo')}</Heading>

          {/* Connection Status */}
          <HStack justify="space-between" w="full">
            <Text fontSize="sm" color="gray.600">
              {t('wallet.status')}: {isConnected ? t('wallet.connected') : t('wallet.disconnected')}
            </Text>
            {isConnected && (
              <Badge colorScheme="green" variant="subtle">
                Active
              </Badge>
            )}
          </HStack>

          {/* Connect/Disconnect Buttons */}
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              colorScheme="blue"
              size="lg"
              w="full"
            >
              {t('common.connect')}
            </Button>
          ) : (
            <Button
              onClick={handleDisconnect}
              colorScheme="red"
              size="lg"
              w="full"
            >
              {t('common.disconnect')}
            </Button>
          )}

          {/* Wallet Information */}
          {account && (
            <VStack
              gap={4}
              align="stretch"
              p={4}
              bg="gray.50"
              borderRadius="md"
            >
              <Text fontWeight="bold" fontSize="lg">
                Wallet Info
              </Text>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  {t('wallet.account')}:
                </Text>
                <Text fontFamily="mono" fontSize="xs" wordBreak="break-all">
                  {account}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  {t('wallet.balance')}:
                </Text>
                <Text fontWeight="semibold" fontSize="lg">
                  {parseFloat(balance).toFixed(4)} ETH
                </Text>
              </Box>
              <Button colorScheme="blue" size="md">
                {t('wallet.send')}
              </Button>
            </VStack>
          )}

          {/* AppKit Modal Trigger Info */}
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Powered by AppKit - Multi-chain wallet connection
          </Text>

          {/* Navigation to DBT */}
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600" mb={2}>
              Explore DBT Features
            </Text>
            <Button
              onClick={() => {
                router.push('/dbt')
              }} // 使用router
              colorScheme="purple"
              size="md"
              variant="outline"
            >
              Go to DBT Wallet
            </Button>
          </Box>
        </VStack>
      </Box>
    </WidthLayout>
  );
}
