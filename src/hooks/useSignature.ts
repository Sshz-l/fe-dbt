'use client';

import { useCallback, useState, useEffect } from 'react';
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
  const { address } = useAccount();
  const { signMessageAsync, isPending } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasValidSignature, setHasValidSignature] = useState(false);
  const [hasRejectedSignature, setHasRejectedSignature] = useState(false);

  // 检查签名是否有效
  const checkStoredSignature = useCallback(async () => {
    if (!address || typeof window === 'undefined') {
      setHasValidSignature(false);
      return;
    }

    try {
      // 检查是否有拒绝记录
      const rejectedSignature = localStorage.getItem(SIGNATURE_REJECTED_KEY);
      setHasRejectedSignature(!!rejectedSignature);

      const storedData = localStorage.getItem(SIGNATURE_KEY);
      if (!storedData) {
        console.log('❌ 未找到存储的签名');
        setHasValidSignature(false);
        return;
      }

      const { signature, address: storedAddress, timestamp } = JSON.parse(storedData);

      // 检查地址是否匹配
      if (storedAddress.toLowerCase() !== address.toLowerCase()) {
        console.log('❌ 签名地址不匹配');
        localStorage.removeItem(SIGNATURE_KEY);
        setHasValidSignature(false);
        return;
      }

      // 检查是否过期（24小时）
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        console.log('❌ 签名已过期');
        localStorage.removeItem(SIGNATURE_KEY);
        setHasValidSignature(false);
        return;
      }

      console.log('✅ 找到有效签名');
      setHasValidSignature(true);
    } catch (error) {
      console.error('检查签名时出错:', error);
      setHasValidSignature(false);
      localStorage.removeItem(SIGNATURE_KEY);
    }
  }, [address]);

  // 初始化时检查签名
  useEffect(() => {
    checkStoredSignature();
  }, [checkStoredSignature]);

  // 创建新签名
  const signForIDOParticipation = useCallback(async () => {
    if (!address) throw new Error('钱包未连接');
    setIsLoading(true);
    setError(null);

    try {
      // 先检查是否已有有效签名
      const storedData = localStorage.getItem(SIGNATURE_KEY);
      if (storedData) {
        const { signature, address: storedAddress, timestamp, message, nonce } = JSON.parse(storedData);
        if (
          storedAddress.toLowerCase() === address.toLowerCase() &&
          Date.now() - timestamp <= 24 * 60 * 60 * 1000
        ) {
          console.log('✅ 使用已存储的有效签名');
          setHasValidSignature(true);
          return { signature, message, timestamp, nonce };
        }
      }

      // 创建新签名
      const timestamp = Date.now();
      const nonce = generateNonce();
      const message = createSignMessage({
        action: 'ido_participation',
        userAddress: address,
        timestamp,
        nonce,
      });

      console.log('🔏 请求新签名...');
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
      // 清除拒绝记录
      localStorage.removeItem(SIGNATURE_REJECTED_KEY);
      
      console.log('✅ 新签名已保存');
      setHasValidSignature(true);
      setHasRejectedSignature(false);
      
      return signatureData;
    } catch (error) {
      console.error('签名失败:', error);
      const errorMessage = error instanceof Error ? error.message : '签名失败';
      setError(errorMessage);
      setHasValidSignature(false);
      // 记录签名拒绝
      localStorage.setItem(SIGNATURE_REJECTED_KEY, 'true');
      setHasRejectedSignature(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync]);

  // 清除签名
  const clearSignature = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SIGNATURE_KEY);
    localStorage.removeItem(SIGNATURE_REJECTED_KEY);
    setHasValidSignature(false);
    setHasRejectedSignature(false);
    console.log('🗑️ 签名已清除');
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signForIDOParticipation,
    isLoading: isLoading || isPending,
    error,
    hasValidSignature,
    hasRejectedSignature,
    clearSignature,
    clearError,
  };
}; 