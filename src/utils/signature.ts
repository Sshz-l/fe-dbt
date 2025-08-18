import { ethers } from 'ethers';

/**
 * 创建签名消息格式
 */
export function createSignMessage(data: {
  action: string;
  userAddress: string;
  timestamp: number;
  nonce?: string;
}): string {
  const message = `fe-dbt IDO Platform

Action: ${data.action}
Address: ${data.userAddress}
Timestamp: ${data.timestamp}
Nonce: ${data.nonce || Math.random().toString(36).substring(7)}

Please sign this message to verify your identity.`;

  return message;
}

/**
 * 验证消息签名
 */
export async function verifySignature(data: {
  message: string;
  signature: string;
  userAddress: string;
}): Promise<boolean> {
  try {
    const recoveredAddress = ethers.verifyMessage(data.message, data.signature);
    return recoveredAddress.toLowerCase() === data.userAddress.toLowerCase();
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

/**
 * 生成随机 nonce
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(7) + Date.now().toString(36);
}

/**
 * 检查签名是否过期 (5分钟内有效)
 */
export function isSignatureExpired(timestamp: number): boolean {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5分钟
  return now - timestamp > maxAge;
} 