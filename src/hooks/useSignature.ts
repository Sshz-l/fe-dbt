'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { createSignMessage, generateNonce } from '@/utils/signature';

export interface SignatureData {
  message: string;
  signature: string;
  timestamp: number;
  nonce: string;
}

export interface StoredSignature {
  address: string;
  data: SignatureData;
  expiresAt: number;
}

const SIGNATURE_KEY = 'dbt_signature_v1';
const SIGNATURE_REJECTED_KEY = 'dbt_signature_rejected';

export const useSignature = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [hasValidSignature, setHasValidSignature] = useState(false);
  const [hasRejectedSignature, setHasRejectedSignature] = useState(false);
  const isInitializedRef = useRef(false);

  // 检查签名状态
  const checkSignatureStatus = useCallback(() => {
    if (!address || typeof window === 'undefined' || !isConnected) {
      setHasValidSignature(false);
      setHasRejectedSignature(false);
      return { hasValid: false, hasRejected: false };
    }

    // 检查是否拒绝过签名
    const rejectedSignature = localStorage.getItem(SIGNATURE_REJECTED_KEY);
    if (rejectedSignature) {
      const { address: rejectedAddress } = JSON.parse(rejectedSignature);
      if (rejectedAddress.toLowerCase() === address.toLowerCase()) {
        setHasRejectedSignature(true);
        return { hasValid: false, hasRejected: true };
      }
    }

    return { hasValid: false, hasRejected: false };
  }, [address, isConnected]);

  // 检查签名是否有效
  const checkStoredSignature = useCallback(async () => {
    if (!address || typeof window === 'undefined' || !isConnected) {
      setHasValidSignature(false);
      return false;
    }

    try {
      const storedData = localStorage.getItem(SIGNATURE_KEY);
      if (!storedData) {
        const status = checkSignatureStatus();
        return status.hasValid;
      }

      const { address: storedAddress, timestamp } = JSON.parse(storedData);

      // 检查地址是否匹配
      if (storedAddress.toLowerCase() !== address.toLowerCase()) {
        localStorage.removeItem(SIGNATURE_KEY);
        const status = checkSignatureStatus();
        return status.hasValid;
      }

      // 检查是否过期（24小时）
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(SIGNATURE_KEY);
        const status = checkSignatureStatus();
        return status.hasValid;
      }

      setHasValidSignature(true);
      return true;
    } catch (error) {
      console.error('检查签名时出错:', error);
      setHasValidSignature(false);
      localStorage.removeItem(SIGNATURE_KEY);
      const status = checkSignatureStatus();
      return status.hasValid;
    }
  }, [address, isConnected, checkSignatureStatus]);

  // 监听钱包连接状态，只在初始化和地址改变时检查签名
  useEffect(() => {
    if (!isInitializedRef.current && isConnected && address) {
      isInitializedRef.current = true;
      checkStoredSignature();
    } else if (!isConnected) {
      isInitializedRef.current = false;
      setHasValidSignature(false);
      setHasRejectedSignature(false);
      localStorage.removeItem(SIGNATURE_KEY);
      localStorage.removeItem(SIGNATURE_REJECTED_KEY);
    }
  }, [isConnected, address, checkStoredSignature]);

  // 创建新签名
  const signForIDOParticipation = useCallback(async () => {
    if (!address || !isConnected) {
      throw new Error('钱包未连接');
    }

    if (isLoading || isPending) {
      console.log('签名操作正在进行中...');
      return null;
    }

    // 检查是否已拒绝过签名
    const status = checkSignatureStatus();
    if (status.hasRejected) {
      console.log('用户已拒绝签名');
      return null;
    }
    
    setIsLoading(true);

    try {
      // 先检查是否已有有效签名
      const hasValid = await checkStoredSignature();
      if (hasValid) {
        console.log('已有有效签名，无需重新签名');
        const storedData = localStorage.getItem(SIGNATURE_KEY);
        return JSON.parse(storedData!);
      }

      console.log('开始请求新签名...');
      // 创建新签名
      const timestamp = Date.now();
      const nonce = generateNonce();
      const message = createSignMessage({
        action: 'ido_participation',
        userAddress: address,
        timestamp,
        nonce,
      });

      const signature = await signMessageAsync({ message });

      // 保存签名
      const signatureData = {
        signature,
        message,
        timestamp,
        nonce,
        address,
      };

      localStorage.setItem(SIGNATURE_KEY, JSON.stringify(signatureData));
      localStorage.removeItem(SIGNATURE_REJECTED_KEY);
      setHasValidSignature(true);
      setHasRejectedSignature(false);
      console.log('新签名已保存');
      
      return signatureData;
    } catch (error) {
      console.error('签名失败:', error);
      // 记录签名拒绝状态
      localStorage.setItem(SIGNATURE_REJECTED_KEY, JSON.stringify({ address, timestamp: Date.now() }));
      setHasValidSignature(false);
      setHasRejectedSignature(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, signMessageAsync, checkStoredSignature, checkSignatureStatus, isLoading, isPending]);

  return {
    signForIDOParticipation,
    isLoading: isLoading || isPending,
    hasValidSignature,
    hasRejectedSignature,
    checkStoredSignature,
  };
}; 