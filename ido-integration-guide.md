# IDO 开发者集成指南

## 概述

本指南详细介绍如何使用 [viem.sh](https://viem.sh/) SDK 集成 DeFi IDO 系统。viem 是一个现代化的以太坊开发工具包，提供 TypeScript 类型安全和优异的开发体验。

## 环境准备

### 1. 安装依赖

```bash
# 核心依赖
npm install viem @wagmi/core wagmi

# Reown AppKit (原 WalletConnect)
npm install @reown/appkit @reown/appkit-adapter-wagmi

# React 支持 (如果使用 React)
npm install @tanstack/react-query

# 或者使用 pnpm
pnpm add viem @wagmi/core wagmi @reown/appkit @reown/appkit-adapter-wagmi @tanstack/react-query
```

### 2. 合约配置

```typescript
// config/contracts.ts
import { defineChain } from 'viem'

// BSC 主网配置
export const bsc = defineChain({
  id: 56,
  name: 'BSC',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: {
      http: ['https://bsc-dataseed1.binance.org'],
    },
    public: {
      http: ['https://bsc-dataseed1.binance.org'],
    },
  },
  blockExplorers: {
    default: { name: 'BSCScan', url: 'https://bscscan.com' },
  },
})

// 合约地址配置
export const contracts = {
  ido: '0x...', // IDO Diamond 代理合约地址
  usdt: '0x55d398326f99059fF775485246999027B3197955', // BSC USDT
  sDBT: '0x...', // sDBT 代币地址
  sbt: '0x...', // SBT NFT 地址
  dbt: '0x...', // DBT 代币地址
} as const
```

### 3. ABI 定义

```typescript
// abi/ido.ts
export const idoAbi = [
  // 管理函数
  {
    name: 'addToWhitelist',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'level', type: 'uint8' }
    ],
    outputs: []
  },
  {
    name: 'removeFromWhitelist',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: []
  },
  {
    name: 'batchAddToWhitelist',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'accounts', type: 'address[]' },
      { name: 'level', type: 'uint8' }
    ],
    outputs: []
  },
  {
    name: 'initializeIDO',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'usdtToken', type: 'address' },
      { name: 'sDBTToken', type: 'address' },
      { name: 'sbtToken', type: 'address' },
      { name: 'treasury', type: 'address' },
      { name: 'dbtToken', type: 'address' },
      { name: 'dbtVault', type: 'address' },
      { name: 'beginTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'updateIDOTimes',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'beginTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' }
    ],
    outputs: []
  },

  // 用户函数
  {
    name: 'participateInIDO',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'referrer', type: 'address' }],
    outputs: []
  },
  {
    name: 'claimSBT',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'withdrawRewards',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },

  // 查询函数
  {
    name: 'getWhitelistLevel',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'level', type: 'uint8' }]
  },
  {
    name: 'getIDOInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'sDBTPerShare', type: 'uint256' },
      { name: 'usdtToken', type: 'address' },
      { name: 'sDBTToken', type: 'address' },
      { name: 'sbtToken', type: 'address' },
      { name: 'treasury', type: 'address' },
      { name: 'status', type: 'uint8' },
      { name: 'totalShares', type: 'uint256' },
      { name: 'beginTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' }
    ]
  },
  {
    name: 'hasParticipated',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'timestamp', type: 'uint256' }]
  },
  {
    name: 'getReferrer',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'participant', type: 'address' }],
    outputs: [{ name: 'referrer', type: 'address' }]
  },
  {
    name: 'getReferralStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'referrer', type: 'address' }],
    outputs: [
      { name: 'referralCount', type: 'uint256' },
      { name: 'sbtsMinted', type: 'uint256' },
      { name: 'sbtsClaimable', type: 'uint256' }
    ]
  },
  {
    name: 'getUnclaimedRewards',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'rewards', type: 'uint256' }]
  },
  {
    name: 'getInviteRecords',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'referrer', type: 'address' }],
    outputs: [{ name: 'invitees', type: 'address[]' }]
  },
  {
    name: 'isValidReferrer',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'referrer', type: 'address' }
    ],
    outputs: [
      { name: 'isValid', type: 'bool' },
      { name: 'reason', type: 'string' }
    ]
  },

  // 事件
  {
    name: 'WhitelistAdded',
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'level', type: 'uint8', indexed: false },
      { name: 'admin', type: 'address', indexed: true }
    ]
  },
  {
    name: 'WhitelistRemoved',
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'level', type: 'uint8', indexed: false },
      { name: 'admin', type: 'address', indexed: true }
    ]
  },
  {
    name: 'IDOPurchase',
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'participant', type: 'address', indexed: true },
      { name: 'referrer', type: 'address', indexed: true },
      { name: 'usdtAmount', type: 'uint256', indexed: false },
      { name: 'sDBTAmount', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'ReferralReward',
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'referrer', type: 'address', indexed: true },
      { name: 'level', type: 'uint8', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'SBTMinted',
    type:'event',
    anonymous: false,
    inputs: [
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: false },
      { name: 'sbtAmount', type: 'uint256', indexed: false }
    ]
  }
] as const

// USDT ABI (用于授权)
export const usdtAbi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: 'success', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: 'allowance', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }]
  }
] as const
```

### 4. AppKit 配置和钱包连接

#### 4.1 AppKit 配置

```typescript
// config/appkit.ts
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bsc, bscTestnet } from 'viem/chains'
import { QueryClient } from '@tanstack/react-query'

// 1. 获取项目ID - 访问 https://cloud.reown.com
const projectId = 'YOUR_PROJECT_ID'

// 2. 创建 wagmi 配置
const metadata = {
  name: 'DeFi IDO DApp',
  description: 'DeFi IDO 参与平台',
  url: 'https://your-domain.com',
  icons: ['https://your-domain.com/icon.png']
}

// 3. 创建 Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  ssr: true,
  projectId,
  networks: [bsc, bscTestnet]
})

// 4. 创建 AppKit 实例
export const appkit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bsc, bscTestnet],
  defaultNetwork: bsc,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple'],
    emailShowWallets: true
  }
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
```

#### 4.2 React 应用配置

```typescript
// providers/AppKitProvider.tsx
'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../config/appkit'

const queryClient = new QueryClient()

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

#### 4.3 客户端初始化

```typescript
// lib/viem.ts
import { createPublicClient, http } from 'viem'
import { bsc } from '../config/contracts'

// 公共客户端 (用于读取)
export const publicClient = createPublicClient({
  chain: bsc,
  transport: http()
})

// 类型定义
export enum WhitelistLevel {
  None = 0,
  L0 = 1,
  L1 = 2,
  L2 = 3
}

export enum IDOStatus {
  Waiting = 0,
  Ing = 1,
  Finished = 2
}
```

#### 4.4 钱包连接组件

```typescript
// components/WalletConnect.tsx
import React from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'

export function WalletConnect() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="address">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
          <button onClick={() => disconnect()} className="disconnect-btn">
            断开连接
          </button>
        </div>
      </div>
    )
  }

  return (
    <button onClick={() => open()} className="connect-wallet-btn">
      连接钱包
    </button>
  )
}
```

#### 4.5 钱包状态 Hook

```typescript
// hooks/useWallet.ts
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { bsc } from 'viem/chains'
import { contracts } from '../config/contracts'

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  const { data: balance } = useBalance({
    address: address,
  })

  const { data: usdtBalance } = useBalance({
    address: address,
    token: contracts.usdt,
  })

  const isCorrectNetwork = chainId === bsc.id
  
  const switchToBSC = () => {
    if (!isCorrectNetwork) {
      switchChain({ chainId: bsc.id })
    }
  }

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    isCorrectNetwork,
    switchToBSC,
    balance: {
      bnb: balance,
      usdt: usdtBalance
    }
  }
}
```

## 钱包签名和验证

### 5. 消息签名功能

#### 5.1 签名服务

```typescript
// services/signature.ts
import { signMessage, verifyMessage } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

/**
 * 生成签名消息格式
 */
export function createSignMessage(data: {
  action: string
  userAddress: string
  timestamp: number
  nonce?: string
}): string {
  const message = `DeFi IDO Platform
  
Action: ${data.action}
Address: ${data.userAddress}
Timestamp: ${data.timestamp}
Nonce: ${data.nonce || Math.random().toString(36).substring(7)}

Please sign this message to verify your identity.`

  return message
}

/**
 * React Hook for message signing
 */
export function useMessageSigning() {
  const { address } = useAccount()
  const { signMessageAsync, isPending, error } = useSignMessage()

  const signForAction = async (action: string): Promise<{
    message: string
    signature: `0x${string}`
    timestamp: number
  }> => {
    if (!address) {
      throw new Error('钱包未连接')
    }

    const timestamp = Date.now()
    const message = createSignMessage({
      action,
      userAddress: address,
      timestamp
    })

    try {
      const signature = await signMessageAsync({ message })
      
      return {
        message,
        signature,
        timestamp
      }
    } catch (error) {
      console.error('签名失败:', error)
      throw new Error('用户拒绝签名或签名失败')
    }
  }

  const signForIDOParticipation = (referrer: string) => {
    return signForAction(`参与IDO (推荐人: ${referrer})`)
  }

  const signForRewardWithdrawal = () => {
    return signForAction('提取推荐奖励')
  }

  const signForSBTClaim = () => {
    return signForAction('领取SBT奖励')
  }

  return {
    signForAction,
    signForIDOParticipation,
    signForRewardWithdrawal,
    signForSBTClaim,
    isPending,
    error
  }
}
```

#### 5.2 签名验证

```typescript
// utils/signature-verify.ts
import { verifyMessage } from 'viem'

export interface SignatureData {
  message: string
  signature: `0x${string}`
  timestamp: number
  userAddress: `0x${string}`
}

/**
 * 验证消息签名
 */
export async function verifySignature(data: SignatureData): Promise<{
  isValid: boolean
  error?: string
}> {
  try {
    // 1. 检查时间戳 (5分钟内有效)
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5分钟
    
    if (now - data.timestamp > maxAge) {
      return {
        isValid: false,
        error: '签名已过期'
      }
    }

    // 2. 验证签名
    const isValid = await verifyMessage({
      address: data.userAddress,
      message: data.message,
      signature: data.signature
    })

    if (!isValid) {
      return {
        isValid: false,
        error: '签名验证失败'
      }
    }

    // 3. 验证消息内容
    if (!data.message.includes(data.userAddress)) {
      return {
        isValid: false,
        error: '消息内容与签名地址不匹配'
      }
    }

    return { isValid: true }

  } catch (error) {
    return {
      isValid: false,
      error: `验证过程出错: ${error}`
    }
  }
}

/**
 * 签名中间件 - 用于保护需要签名的操作
 */
export function createSignatureMiddleware() {
  const signatures = new Map<string, SignatureData>()

  return {
    // 存储签名
    storeSignature: (key: string, signatureData: SignatureData) => {
      signatures.set(key, signatureData)
    },

    // 验证并消费签名 (一次性使用)
    verifyAndConsume: async (key: string, expectedAddress: `0x${string}`) => {
      const signatureData = signatures.get(key)
      
      if (!signatureData) {
        throw new Error('未找到签名数据')
      }

      if (signatureData.userAddress !== expectedAddress) {
        throw new Error('签名地址不匹配')
      }

      const verification = await verifySignature(signatureData)
      
      if (!verification.isValid) {
        throw new Error(verification.error || '签名验证失败')
      }

      // 验证成功后删除签名 (防止重复使用)
      signatures.delete(key)
      
      return true
    }
  }
}
```

## 功能实现示例

### 1. 白名单管理

#### 添加单个地址到白名单

```typescript
// services/whitelist.ts
import { walletClient, publicClient } from '../lib/viem'
import { contracts } from '../config/contracts'
import { idoAbi } from '../abi/ido'
import { WhitelistLevel } from '../lib/viem'

/**
 * 添加地址到白名单
 */
export async function addToWhitelist(
  account: `0x${string}`,
  level: WhitelistLevel
): Promise<`0x${string}`> {
  try {
    // 发送交易
    const hash = await walletClient.writeContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'addToWhitelist',
      args: [account, level]
    })
    
    // 等待交易确认
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    if (receipt.status === 'success') {
      console.log(`成功添加 ${account} 到 L${level} 级别白名单`)
      return hash
    } else {
      throw new Error('交易失败')
    }
  } catch (error) {
    console.error('添加白名单失败:', error)
    throw error
  }
}

/**
 * 批量添加白名单
 */
export async function batchAddToWhitelist(
  accounts: `0x${string}`[],
  level: WhitelistLevel
): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'batchAddToWhitelist',
    args: [accounts, level]
  })
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  
  if (receipt.status === 'success') {
    console.log(`批量添加 ${accounts.length} 个地址到 L${level} 级别`)
  }
  
  return hash
}

/**
 * 移除白名单
 */
export async function removeFromWhitelist(
  account: `0x${string}`
): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'removeFromWhitelist',
    args: [account]
  })
  
  await publicClient.waitForTransactionReceipt({ hash })
  console.log(`已移除 ${account} 的白名单资格`)
  
  return hash
}
```

#### 查询白名单状态

```typescript
/**
 * 获取白名单级别
 */
export async function getWhitelistLevel(
  account: `0x${string}`
): Promise<WhitelistLevel> {
  const level = await publicClient.readContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'getWhitelistLevel',
    args: [account]
  })
  
  return level as WhitelistLevel
}

/**
 * 检查是否在白名单中 (基于级别判断)
 */
export async function isWhitelisted(account: `0x${string}`): Promise<boolean> {
  const level = await getWhitelistLevel(account)
  return level > 0 // 任何大于0的级别都表示在白名单中
}

/**
 * 批量检查白名单状态
 */
export async function batchCheckWhitelist(
  accounts: `0x${string}`[]
): Promise<WhitelistLevel[]> {
  const levels = await Promise.all(
    accounts.map(account => getWhitelistLevel(account))
  )
  
  return levels
}


/**
 * 分页获取推荐记录
 */
export async function getInviteRecordsPaginated(
  referrer: `0x${string}`,
  offset: number = 0,
  limit: number = 10
): Promise<{
  invitees: `0x${string}`[]
  total: number
  hasMore: boolean
  currentPage: number
  totalPages: number
}> {
  const result = await publicClient.readContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'getInviteRecords',
    args: [referrer, BigInt(offset), BigInt(limit)]
  })
  
  const [invitees, total, hasMore] = result as [`0x${string}`[], bigint, boolean]
  const totalNumber = Number(total)
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(totalNumber / limit)
  
  return {
    invitees,
    total: totalNumber,
    hasMore,
    currentPage,
    totalPages
  }
}

/**
 * 获取推荐记录的帮助函数（统一接口）
 */
export async function getInviteRecordsOptimal(
  referrer: `0x${string}`,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  invitees: `0x${string}`[]
  total: number
  hasMore: boolean
  currentPage: number
  totalPages: number
}> {
  // 直接使用分页查询
  const offset = (page - 1) * pageSize
  return await getInviteRecordsPaginated(referrer, offset, pageSize)
}

/**
 * 验证推荐人是否有效
 */
export async function validateReferrer(
  user: `0x${string}`,
  referrer: `0x${string}`
): Promise<{
  isValid: boolean
  reason: string
}> {
  const [isValid, reason] = await publicClient.readContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'isValidReferrer',
    args: [user, referrer]
  })
  
  return {
    isValid,
    reason
  }
}
```

### 2. IDO管理功能

#### IDO初始化

```typescript
// services/ido-admin.ts
import { walletClient, publicClient } from '../lib/viem'
import { contracts } from '../config/contracts'
import { idoAbi } from '../abi/ido'

/**
 * 初始化IDO
 */
export async function initializeIDO(params: {
  usdtToken: `0x${string}`
  sDBTToken: `0x${string}`
  sbtToken: `0x${string}`
  treasury: `0x${string}`
  dbtToken: `0x${string}`
  dbtVault: `0x${string}`
  beginTime: Date
  endTime: Date
}): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'initializeIDO',
    args: [
      params.usdtToken,
      params.sDBTToken,
      params.sbtToken,
      params.treasury,
      params.dbtToken,
      params.dbtVault,
      BigInt(Math.floor(params.beginTime.getTime() / 1000)),
      BigInt(Math.floor(params.endTime.getTime() / 1000))
    ]
  })
  
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('IDO初始化成功')
  
  return hash
}

/**
 * 更新IDO时间
 */
export async function updateIDOTimes(
  beginTime: Date,
  endTime: Date
): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'updateIDOTimes',
    args: [
      BigInt(Math.floor(beginTime.getTime() / 1000)),
      BigInt(Math.floor(endTime.getTime() / 1000))
    ]
  })
  
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('IDO时间更新成功')
  
  return hash
}
```

### 3. 推荐人验证功能

#### 使用 isValidReferrer 验证推荐关系

```typescript
// services/referrer-validation.ts
import { publicClient } from '../lib/viem'
import { contracts } from '../config/contracts'
import { idoAbi } from '../abi/ido'

/**
 * 验证推荐人是否有效并返回详细错误信息
 */
export async function validateReferrer(
  user: `0x${string}`,
  referrer: `0x${string}`
): Promise<{
  isValid: boolean
  reason: string
}> {
  try {
    const [isValid, reason] = await publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'isValidReferrer',
      args: [user, referrer]
    })
    
    return {
      isValid,
      reason
    }
  } catch (error) {
    console.error('验证推荐人时出错:', error)
    return {
      isValid: false,
      reason: '验证过程出错，请重试'
    }
  }
}

/**
 * 前端友好的推荐人验证Hook
 */
export function useReferrerValidation() {
  const [validationState, setValidationState] = useState<{
    isValid: boolean | null
    reason: string
    isValidating: boolean
  }>({
    isValid: null,
    reason: '',
    isValidating: false
  })

  const validateReferrerAsync = async (user: `0x${string}`, referrer: `0x${string}`) => {
    setValidationState(prev => ({ ...prev, isValidating: true }))
    
    try {
      const result = await validateReferrer(user, referrer)
      setValidationState({
        isValid: result.isValid,
        reason: result.reason,
        isValidating: false
      })
      
      return result
    } catch (error) {
      setValidationState({
        isValid: false,
        reason: '验证失败，请重试',
        isValidating: false
      })
      
      throw error
    }
  }

  const clearValidation = () => {
    setValidationState({
      isValid: null,
      reason: '',
      isValidating: false
    })
  }

  return {
    ...validationState,
    validateReferrer: validateReferrerAsync,
    clearValidation
  }
}
```

#### 推荐人验证规则说明

IDO系统的推荐人验证遵循以下层级规则：

```typescript
// utils/referrer-rules.ts

export enum WhitelistLevel {
  None = 0,
  L0 = 1,  // 核心团队 (8%奖励，仅可推荐不可参与)
  L1 = 2,  // 一线成员 (10%奖励)
  L2 = 3   // 团队领袖 (15%奖励)
}

/**
 * 推荐人验证规则矩阵
 */
export const REFERRER_VALIDATION_RULES = {
  // 基础规则
  ZERO_ADDRESS: 'Referrer is zero address',
  SELF_REFERRAL: 'Self referral not allowed',
  
  // 白名单用户规则
  REFERRER_NOT_WHITELISTED: 'Referrer is not whitelisted',
  REFERRER_LEVEL_TOO_LOW: 'Referrer must be higher level',
  
  // 非白名单用户规则
  REFERRER_NOT_QUALIFIED: 'Referrer must be whitelisted or have participated'
}

/**
 * 获取用户友好的错误信息
 */
export function getUserFriendlyErrorMessage(reason: string): string {
  const errorMap: Record<string, string> = {
    'Referrer is zero address': '请输入有效的推荐人地址',
    'Self referral not allowed': '不能推荐自己',
    'Referrer is not whitelisted': '推荐人必须在白名单中',
    'Referrer must be higher level': '推荐人级别必须高于您的级别',
    'Referrer must be whitelisted or have participated': '推荐人必须在白名单中或已参与过IDO'
  }
  
  return errorMap[reason] || reason || '推荐人验证失败'
}
```

#### 推荐人验证组件示例

```tsx
// components/ReferrerValidation.tsx
import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useReferrerValidation } from '../services/referrer-validation'
import { getUserFriendlyErrorMessage } from '../utils/referrer-rules'

interface ReferrerValidationProps {
  referrer: string
  onValidationChange: (isValid: boolean, reason: string) => void
  className?: string
}

export const ReferrerValidation: React.FC<ReferrerValidationProps> = ({
  referrer,
  onValidationChange,
  className = ''
}) => {
  const { address } = useAccount()
  const { isValid, reason, isValidating, validateReferrer } = useReferrerValidation()
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // 防抖验证
  useEffect(() => {
    if (!address || !referrer || referrer.length !== 42) {
      onValidationChange(false, '')
      return
    }

    // 清除之前的定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // 设置新的防抖定时器
    const timer = setTimeout(() => {
      validateReferrer(address, referrer as `0x${string}`)
        .then(result => {
          onValidationChange(result.isValid, result.reason)
        })
        .catch(() => {
          onValidationChange(false, '验证失败')
        })
    }, 500) // 500ms 防抖

    setDebounceTimer(timer)

    // 清理函数
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [address, referrer])

  if (!referrer || referrer.length !== 42) {
    return null
  }

  if (isValidating) {
    return (
      <div className={`referrer-validation validating ${className}`}>
        <span className="spinner">⏳</span>
        <span>验证推荐人中...</span>
      </div>
    )
  }

  if (isValid === null) {
    return null
  }

  return (
    <div className={`referrer-validation ${isValid ? 'valid' : 'invalid'} ${className}`}>
      {isValid ? (
        <div className="validation-success">
          <span className="icon">✅</span>
          <span>推荐人有效</span>
        </div>
      ) : (
        <div className="validation-error">
          <span className="icon">❌</span>
          <span>{getUserFriendlyErrorMessage(reason)}</span>
        </div>
      )}
    </div>
  )
}
```

### 4. 用户参与功能

#### 参与IDO (集成签名验证)

```typescript
// services/ido-participation.ts
import { parseUnits } from 'viem'
import { publicClient, IDOStatus } from '../lib/viem'
import { contracts } from '../config/contracts'
import { idoAbi, usdtAbi } from '../abi/ido'
import { useWriteContract, useAccount } from 'wagmi'
import { useMessageSigning } from './signature'
import { verifySignature, createSignatureMiddleware } from '../utils/signature-verify'

// 创建签名中间件实例
const signatureMiddleware = createSignatureMiddleware()

/**
 * 检查参与条件
 */
export async function checkParticipationEligibility(
  userAddress: `0x${string}`,
  referrer: `0x${string}`
): Promise<{
  canParticipate: boolean
  reason?: string
}> {
  try {
    // 检查IDO状态
    const idoInfo = await publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'getIDOInfo'
    })
    
    const idoStatus = idoInfo[6] as IDOStatus // status 是第7个字段 (索引6)
    
    if (idoStatus !== IDOStatus.Ing) {
      return { canParticipate: false, reason: 'IDO未在进行中' }
    }
    
    // 检查是否已参与
    const participationTimestamp = await publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'hasParticipated',
      args: [userAddress]
    })
    
    if (participationTimestamp > 0n) {
      return { canParticipate: false, reason: '已经参与过IDO' }
    }
    
    // 检查用户白名单级别
    const userLevel = await publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'getWhitelistLevel',
      args: [userAddress]
    })
    
    if (userLevel === 1) { // L0级别
      return { canParticipate: false, reason: 'L0级别用户不能参与购买' }
    }
    
    // 检查推荐人有效性
    const [isValidReferrer, invalidReason] = await publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'isValidReferrer',
      args: [userAddress, referrer]
    })
    
    if (!isValidReferrer) {
      return { canParticipate: false, reason: `推荐人无效: ${invalidReason}` }
    }
    
    // 检查USDT余额
    const usdtBalance = await publicClient.readContract({
      address: contracts.usdt,
      abi: usdtAbi,
      functionName: 'balanceOf',
      args: [userAddress]
    })
    
    const idoPrice = parseUnits('330', 18) // 330 USDT
    if (usdtBalance < idoPrice) {
      return { canParticipate: false, reason: 'USDT余额不足' }
    }
    
    // 检查授权额度
    const allowance = await publicClient.readContract({
      address: contracts.usdt,
      abi: usdtAbi,
      functionName: 'allowance',
      args: [userAddress, contracts.ido]
    })
    
    if (allowance < idoPrice) {
      return { canParticipate: false, reason: '需要先授权USDT' }
    }
    
    return { canParticipate: true }
  } catch (error) {
    return { canParticipate: false, reason: `检查失败: ${error}` }
  }
}

/**
 * 授权USDT
 */
export async function approveUSDT(
  amount: bigint = parseUnits('330', 18)
): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    address: contracts.usdt,
    abi: usdtAbi,
    functionName: 'approve',
    args: [contracts.ido, amount]
  })
  
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('USDT授权成功')
  
  return hash
}

/**
 * 带签名验证的 IDO 参与 Hook
 */
export function useIDOParticipation() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { signForIDOParticipation, isPending: isSignPending } = useMessageSigning()

  const participateWithSignature = async (referrer: `0x${string}`) => {
    if (!address) {
      throw new Error('钱包未连接')
    }

    // 1. 检查参与条件
    const eligibility = await checkParticipationEligibility(address, referrer)
    
    if (!eligibility.canParticipate) {
      throw new Error(eligibility.reason)
    }

    // 2. 请求用户签名
    const signatureData = await signForIDOParticipation(referrer)
    
    // 3. 验证签名
    const verification = await verifySignature({
      ...signatureData,
      userAddress: address
    })

    if (!verification.isValid) {
      throw new Error(verification.error || '签名验证失败')
    }

    // 4. 存储签名用于后续验证
    const signatureKey = `ido-${address}-${Date.now()}`
    signatureMiddleware.storeSignature(signatureKey, {
      ...signatureData,
      userAddress: address
    })

    try {
      // 5. 执行合约调用
      const hash = await writeContractAsync({
        address: contracts.ido,
        abi: idoAbi,
        functionName: 'participateInIDO',
        args: [referrer]
      })

      // 6. 验证并消费签名
      await signatureMiddleware.verifyAndConsume(signatureKey, address)

      console.log('成功参与IDO!', { hash, signature: signatureData.signature })
      
      return hash

    } catch (error) {
      // 如果交易失败，清理签名
      signatureMiddleware.verifyAndConsume(signatureKey, address).catch(() => {})
      throw error
    }
  }

  return {
    participateWithSignature,
    isSignPending
  }
}

/**
 * 兼容旧版本的直接调用函数
 */
export async function participateInIDO(
  referrer: `0x${string}`,
  userAddress: `0x${string}`,
  writeContract: any
): Promise<`0x${string}`> {
  // 先检查参与条件
  const eligibility = await checkParticipationEligibility(userAddress, referrer)
  
  if (!eligibility.canParticipate) {
    throw new Error(eligibility.reason)
  }
  
  // 参与IDO
  const hash = await writeContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'participateInIDO',
    args: [referrer]
  })
  
  return hash
}
```

#### 领取奖励

```typescript
/**
 * 领取SBT奖励
 */
export async function claimSBT(): Promise<`0x${string}`> {
  // 先查询可领取数量
  const stats = await publicClient.readContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'getReferralStats',
    args: [walletClient.account.address]
  })
  
  const [referralCount, sbtsMinted, sbtsClaimable] = stats
  
  if (sbtsClaimable === 0n) {
    throw new Error('没有可领取的SBT')
  }
  
  console.log(`可领取 ${sbtsClaimable} 个SBT (推荐了 ${referralCount} 人)`)
  
  const hash = await walletClient.writeContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'claimSBT'
  })
  
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('SBT领取成功!')
  
  return hash
}

/**
 * 提取推荐奖励
 */
export async function withdrawRewards(): Promise<`0x${string}`> {
  // 先查询未提取奖励
  const unclaimedRewards = await publicClient.readContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'getUnclaimedRewards',
    args: [walletClient.account.address]
  })
  
  if (unclaimedRewards === 0n) {
    throw new Error('没有可提取的奖励')
  }
  
  console.log(`可提取奖励: ${unclaimedRewards} USDT`)
  
  const hash = await walletClient.writeContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'withdrawRewards'
  })
  
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('奖励提取成功!')
  
  return hash
}
```

### 4. 数据查询和展示

#### IDO信息查询

```typescript
// services/ido-queries.ts
import { formatUnits } from 'viem'
import { publicClient, IDOStatus } from '../lib/viem'
import { contracts } from '../config/contracts'
import { idoAbi } from '../abi/ido'

/**
 * 获取IDO完整信息
 */
export async function getIDOInfo() {
  const result = await publicClient.readContract({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'getIDOInfo'
  })
  
  const [
    price,
    sDBTPerShare,
    usdtToken,
    sDBTToken,
    sbtToken,
    treasury,
    status,
    totalShares,
    beginTime,
    endTime
  ] = result
  
  return {
    price: {
      raw: price,
      formatted: formatUnits(price, 18),
      display: `${formatUnits(price, 18)} USDT`
    },
    sDBTPerShare: {
      raw: sDBTPerShare,
      formatted: formatUnits(sDBTPerShare, 18),
      display: `${formatUnits(sDBTPerShare, 18)} sDBT`
    },
    addresses: {
      usdtToken,
      sDBTToken,
      sbtToken,
      treasury
    },
    status: {
      raw: status,
      text: getStatusText(status as IDOStatus),
      color: getStatusColor(status as IDOStatus)
    },
    totalShares: Number(totalShares),
    timing: {
      beginTime: new Date(Number(beginTime) * 1000),
      endTime: new Date(Number(endTime) * 1000),
      isActive: status === IDOStatus.Ing,
      timeRemaining: getTimeRemaining(Number(endTime))
    },
    progress: {
      totalRaised: formatUnits(price * totalShares, 18),
      totalSDBTDistributed: formatUnits(sDBTPerShare * totalShares, 18)
    }
  }
}

function getStatusText(status: IDOStatus): string {
  switch (status) {
    case IDOStatus.Waiting: return '等待开始'
    case IDOStatus.Ing: return '进行中'
    case IDOStatus.Finished: return '已结束'
    default: return '未知状态'
  }
}

function getStatusColor(status: IDOStatus): string {
  switch (status) {
    case IDOStatus.Waiting: return 'orange'
    case IDOStatus.Ing: return 'green'
    case IDOStatus.Finished: return 'gray'
    default: return 'gray'
  }
}

function getTimeRemaining(endTime: number): string {
  const now = Date.now() / 1000
  const remaining = endTime - now
  
  if (remaining <= 0) return '已结束'
  
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

/**
 * 获取用户参与状态
 */
export async function getUserParticipationInfo(userAddress: `0x${string}`) {
  const [
    hasParticipated,
    referrer,
    referralStats,
    unclaimedRewards,
    whitelistLevel
  ] = await Promise.all([
    publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'hasParticipated',
      args: [userAddress]
    }),
    publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'getReferrer',
      args: [userAddress]
    }),
    publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'getReferralStats',
      args: [userAddress]
    }),
    publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'getUnclaimedRewards',
      args: [userAddress]
    }),
    publicClient.readContract({
      address: contracts.ido,
      abi: idoAbi,
      functionName: 'getWhitelistLevel',
      args: [userAddress]
    })
  ])
  
  const [referralCount, sbtsMinted, sbtsClaimable] = referralStats
  
  return {
    hasParticipated: hasParticipated > 0n,
    referrer: referrer === '0x0000000000000000000000000000000000000000' ? null : referrer,
    participationTime: hasParticipated > 0n ? new Date(Number(hasParticipated) * 1000) : null,
    whitelistLevel,
    referralStats: {
      totalReferrals: Number(referralCount),
      sbtsMinted: Number(sbtsMinted),
      sbtsClaimable: Number(sbtsClaimable)
    },
    rewards: {
      unclaimed: formatUnits(unclaimedRewards, 18),
      hasRewards: unclaimedRewards > 0n
    }
  }
}

/**
 * 获取用户推荐记录分页数据
 */
export async function getUserInviteRecordsWithPagination(
  referrer: `0x${string}`,
  page: number = 1,
  pageSize: number = 10
) {
  const records = await getInviteRecords(referrer)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  return {
    invitees: records.invitees.slice(startIndex, endIndex),
    total: records.total,
    currentPage: page,
    pageSize,
    totalPages: Math.ceil(records.total / pageSize),
    hasMore: endIndex < records.total
  }
}
```

### 5. 事件监听

#### 实时事件监听

```typescript
// services/event-listener.ts
import { parseAbiItem } from 'viem'
import { publicClient } from '../lib/viem'
import { contracts } from '../config/contracts'

/**
 * 监听IDO购买事件
 */
export function watchIDOPurchases(
  callback: (event: {
    participant: `0x${string}`
    referrer: `0x${string}`
    usdtAmount: bigint
    sDBTAmount: bigint
    transactionHash: `0x${string}`
  }) => void
) {
  const unwatch = publicClient.watchEvent({
    address: contracts.ido,
    event: parseAbiItem('event IDOPurchase(address indexed participant, address indexed referrer, uint256 usdtAmount, uint256 sDBTAmount)'),
    onLogs: (logs) => {
      logs.forEach(log => {
        callback({
          participant: log.args.participant!,
          referrer: log.args.referrer!,
          usdtAmount: log.args.usdtAmount!,
          sDBTAmount: log.args.sDBTAmount!,
          transactionHash: log.transactionHash
        })
      })
    }
  })
  
  return unwatch
}

/**
 * 监听推荐奖励事件
 */
export function watchReferralRewards(
  callback: (event: {
    referrer: `0x${string}`
    level: number
    amount: bigint
    transactionHash: `0x${string}`
  }) => void
) {
  const unwatch = publicClient.watchEvent({
    address: contracts.ido,
    event: parseAbiItem('event ReferralReward(address indexed referrer, uint8 level, uint256 amount)'),
    onLogs: (logs) => {
      logs.forEach(log => {
        callback({
          referrer: log.args.referrer!,
          level: log.args.level!,
          amount: log.args.amount!,
          transactionHash: log.transactionHash
        })
      })
    }
  })
  
  return unwatch
}

/**
 * 监听白名单变化
 */
export function watchWhitelistChanges(
  callback: (event: {
    type: 'added' | 'removed'
    account: `0x${string}`
    level: number
    admin: `0x${string}`
    transactionHash: `0x${string}`
  }) => void
) {
  // 监听添加事件
  const unwatchAdd = publicClient.watchEvent({
    address: contracts.ido,
    event: parseAbiItem('event WhitelistAdded(address indexed account, uint8 level, address indexed admin)'),
    onLogs: (logs) => {
      logs.forEach(log => {
        callback({
          type: 'added',
          account: log.args.account!,
          level: log.args.level!,
          admin: log.args.admin!,
          transactionHash: log.transactionHash
        })
      })
    }
  })
  
  // 监听移除事件
  const unwatchRemove = publicClient.watchEvent({
    address: contracts.ido,
    event: parseAbiItem('event WhitelistRemoved(address indexed account, uint8 level, address indexed admin)'),
    onLogs: (logs) => {
      logs.forEach(log => {
        callback({
          type: 'removed',
          account: log.args.account!,
          level: log.args.level!,
          admin: log.args.admin!,
          transactionHash: log.transactionHash
        })
      })
    }
  })
  
  return () => {
    unwatchAdd()
    unwatchRemove()
  }
}
```

#### 历史事件查询

```typescript
/**
 * 查询历史IDO购买记录
 */
export async function getIDOPurchaseHistory(
  fromBlock?: bigint,
  toBlock?: bigint
) {
  const logs = await publicClient.getLogs({
    address: contracts.ido,
    event: parseAbiItem('event IDOPurchase(address indexed participant, address indexed referrer, uint256 usdtAmount, uint256 sDBTAmount)'),
    fromBlock: fromBlock || 'earliest',
    toBlock: toBlock || 'latest'
  })
  
  return logs.map(log => ({
    participant: log.args.participant!,
    referrer: log.args.referrer!,
    usdtAmount: log.args.usdtAmount!,
    sDBTAmount: log.args.sDBTAmount!,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
    blockTimestamp: log.blockNumber // 需要额外查询区块时间
  }))
}

/**
 * 获取用户的推荐奖励历史
 */
export async function getUserReferralRewards(
  referrer: `0x${string}`,
  fromBlock?: bigint
) {
  const logs = await publicClient.getLogs({
    address: contracts.ido,
    event: parseAbiItem('event ReferralReward(address indexed referrer, uint8 level, uint256 amount)'),
    args: {
      referrer
    },
    fromBlock: fromBlock || 'earliest'
  })
  
  return logs.map(log => ({
    level: log.args.level!,
    amount: log.args.amount!,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash
  }))
}
```

### 6. React组件示例

#### IDO信息展示组件

```tsx
// components/IDOInfo.tsx
import React, { useState, useEffect } from 'react'
import { getIDOInfo } from '../services/ido-queries'

interface IDOInfoProps {
  refreshInterval?: number
}

export const IDOInfo: React.FC<IDOInfoProps> = ({ refreshInterval = 10000 }) => {
  const [idoInfo, setIdoInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchIDOInfo = async () => {
    try {
      const info = await getIDOInfo()
      setIdoInfo(info)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取IDO信息失败')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchIDOInfo()
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchIDOInfo, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshInterval])
  
  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error}</div>
  if (!idoInfo) return <div>无数据</div>
  
  return (
    <div className="ido-info">
      <h2>DeFi IDO 信息</h2>
      
      <div className="status-section">
        <div className={`status ${idoInfo.status.color}`}>
          {idoInfo.status.text}
        </div>
        {idoInfo.timing.isActive && (
          <div className="countdown">
            剩余时间: {idoInfo.timing.timeRemaining}
          </div>
        )}
      </div>
      
      <div className="info-grid">
        <div className="info-item">
          <label>单价</label>
          <value>{idoInfo.price.display}</value>
        </div>
        
        <div className="info-item">
          <label>每份获得</label>
          <value>{idoInfo.sDBTPerShare.display}</value>
        </div>
        
        <div className="info-item">
          <label>已售份数</label>
          <value>{idoInfo.totalShares}</value>
        </div>
        
        <div className="info-item">
          <label>总筹集</label>
          <value>{idoInfo.progress.totalRaised} USDT</value>
        </div>
      </div>
      
      <div className="timing-section">
        <div>开始时间: {idoInfo.timing.beginTime.toLocaleString()}</div>
        <div>结束时间: {idoInfo.timing.endTime.toLocaleString()}</div>
      </div>
    </div>
  )
}
```

#### 推荐记录展示组件

```tsx
// components/InviteRecordsTable.tsx
import React, { useState, useEffect } from 'react'
import { getInviteRecords } from '../services/ido-queries'

interface InviteRecordsTableProps {
  referrer: `0x${string}`
  pageSize?: number
}

export const InviteRecordsTable: React.FC<InviteRecordsTableProps> = ({ 
  referrer, 
  pageSize = 10 
}) => {
  const [records, setRecords] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRecords = async (page: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getUserInviteRecordsWithPagination(referrer, page, pageSize)
      setRecords(result)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (referrer) {
      loadRecords(1)
    }
  }, [referrer])

  if (loading && !records) {
    return <div className="loading">加载推荐记录中...</div>
  }

  if (error) {
    return <div className="error">❌ {error}</div>
  }

  if (!records || records.total === 0) {
    return (
      <div className="no-records">
        <p>🔍 暂无推荐记录</p>
        <p>开始推荐好友参与 IDO 吧！</p>
      </div>
    )
  }

  const totalPages = Math.ceil(records.total / pageSize)

  return (
    <div className="invite-records-table">
      <div className="table-header">
        <h3>📋 推荐记录</h3>
        <div className="stats">
          <span>总计推荐: <strong>{records.total}</strong> 人</span>
        </div>
      </div>

      <div className="table-content">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>推荐地址</th>
              <th>参与时间</th>
            </tr>
          </thead>
          <tbody>
            {records.invitees.map((invitee: `0x${string}`, index: number) => (
              <tr key={invitee}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                <td className="address">
                  <span title={invitee}>
                    {invitee.slice(0, 6)}...{invitee.slice(-4)}
                  </span>
                </td>
                <td>已参与IDO</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => loadRecords(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="page-btn"
          >
            ← 上一页
          </button>
          
          <div className="page-info">
            第 <strong>{currentPage}</strong> 页，共 <strong>{totalPages}</strong> 页
          </div>
          
          <button 
            onClick={() => loadRecords(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="page-btn"
          >
            下一页 →
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <span>加载中...</span>
        </div>
      )}
    </div>
  )
}
```

#### 集成钱包连接和签名的 IDO 参与组件

```tsx
// components/ParticipateIDO.tsx
import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { parseUnits } from 'viem'
import { WalletConnect } from './WalletConnect'
import { useWallet } from '../hooks/useWallet'
import { useIDOParticipation, checkParticipationEligibility } from '../services/ido-participation'
import { useMessageSigning } from '../services/signature'
import { contracts } from '../config/contracts'
import { usdtAbi } from '../abi/ido'

interface ParticipateIDOProps {
  onSuccess?: (txHash: string) => void
  onSignature?: (signature: string) => void
}

export const ParticipateIDO: React.FC<ParticipateIDOProps> = ({ 
  onSuccess, 
  onSignature 
}) => {
  const { address, isConnected } = useAccount()
  const { isCorrectNetwork, switchToBSC } = useWallet()
  const { writeContractAsync } = useWriteContract()
  const { participateWithSignature, isSignPending } = useIDOParticipation()
  
  const [referrer, setReferrer] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [eligibility, setEligibility] = useState<any>(null)
  const [step, setStep] = useState<'connect' | 'network' | 'approve' | 'sign' | 'participate'>('connect')
  
  const checkEligibility = async () => {
    if (!address || !referrer) return
    
    try {
      const result = await checkParticipationEligibility(
        address as `0x${string}`,
        referrer as `0x${string}`
      )
      setEligibility(result)
      setNeedsApproval(result.reason === '需要先授权USDT')
      
      // 更新步骤
      if (!isConnected) {
        setStep('connect')
      } else if (!isCorrectNetwork) {
        setStep('network')
      } else if (result.reason === '需要先授权USDT') {
        setStep('approve')
      } else if (result.canParticipate) {
        setStep('sign')
      }
    } catch (error) {
      console.error('检查资格失败:', error)
    }
  }
  
  useEffect(() => {
    checkEligibility()
  }, [address, referrer, isConnected, isCorrectNetwork])
  
  const handleApprove = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      const hash = await writeContractAsync({
        address: contracts.usdt,
        abi: usdtAbi,
        functionName: 'approve',
        args: [contracts.ido, parseUnits('330', 18)]
      })
      
      console.log('授权成功:', hash)
      await checkEligibility() // 重新检查
    } catch (error) {
      console.error('授权失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleParticipate = async () => {
    if (!referrer || !address) return
    
    setLoading(true)
    try {
      // 使用带签名验证的参与功能
      const txHash = await participateWithSignature(referrer as `0x${string}`)
      
      onSuccess?.(txHash)
      setStep('participate')
    } catch (error) {
      console.error('参与失败:', error)
      // 根据错误类型给出不同提示
      if (error instanceof Error && error.message.includes('用户拒绝签名')) {
        alert('您拒绝了签名，无法参与IDO')
      } else {
        alert(`参与失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // 如果未连接钱包
  if (!isConnected) {
    return (
      <div className="participate-ido">
        <h3>参与IDO</h3>
        <p>请先连接钱包</p>
        <WalletConnect />
      </div>
    )
  }

  // 如果网络不正确
  if (!isCorrectNetwork) {
    return (
      <div className="participate-ido">
        <h3>参与IDO</h3>
        <p>请切换到 BSC 网络</p>
        <button onClick={switchToBSC} className="switch-network-btn">
          切换到 BSC
        </button>
      </div>
    )
  }
  
  return (
    <div className="participate-ido">
      <h3>参与IDO</h3>
      
      {/* 钱包连接状态 */}
      <div className="wallet-status">
        <WalletConnect />
      </div>
      
      {/* 推荐人输入 */}
      <div className="form-group">
        <label>推荐人地址</label>
        <input
          type="text"
          value={referrer}
          onChange={(e) => setReferrer(e.target.value)}
          placeholder="0x..."
          className="address-input"
        />
      </div>
      
      {/* 资格检查结果 */}
      {eligibility && (
        <div className={`eligibility ${eligibility.canParticipate ? 'success' : 'error'}`}>
          {eligibility.canParticipate ? '✅ 符合参与条件' : `❌ ${eligibility.reason}`}
        </div>
      )}
      
      {/* 步骤指示器 */}
      <div className="steps">
        <div className={`step ${step === 'connect' ? 'active' : isConnected ? 'completed' : ''}`}>
          1. 连接钱包
        </div>
        <div className={`step ${step === 'network' ? 'active' : isCorrectNetwork ? 'completed' : ''}`}>
          2. 切换网络
        </div>
        <div className={`step ${step === 'approve' ? 'active' : !needsApproval ? 'completed' : ''}`}>
          3. 授权代币
        </div>
        <div className={`step ${step === 'sign' ? 'active' : ''}`}>
          4. 签名确认
        </div>
        <div className={`step ${step === 'participate' ? 'active' : ''}`}>
          5. 完成参与
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="action-buttons">
        {needsApproval && step === 'approve' && (
          <button 
            onClick={handleApprove}
            disabled={loading}
            className="approve-button"
          >
            {loading ? '授权中...' : '授权 330 USDT'}
          </button>
        )}
        
        {step === 'sign' && (
          <button
            onClick={handleParticipate}
            disabled={loading || isSignPending || !eligibility?.canParticipate}
            className="participate-button"
          >
            {isSignPending 
              ? '等待签名...' 
              : loading 
              ? '参与中...' 
              : '签名并参与IDO'
            }
          </button>
        )}
      </div>
      
      {/* 签名状态提示 */}
      {isSignPending && (
        <div className="signing-status">
          <p>🔏 请在钱包中签名确认您的身份...</p>
        </div>
      )}
      
      {/* IDO 信息 */}
      <div className="ido-info">
        <div className="info-item">
          <span>💰 支付:</span>
          <span>330 USDT</span>
        </div>
        <div className="info-item">
          <span>🎁 获得:</span>
          <span>5,000 sDBT</span>
        </div>
        <div className="info-item">
          <span>🔄 推荐奖励:</span>
          <span>33% 分发给推荐链</span>
        </div>
        <div className="info-item">
          <span>🔐 安全保障:</span>
          <span>签名验证 + 智能合约保护</span>
        </div>
      </div>
    </div>
  )
}
```

## 错误处理最佳实践

### 常见错误处理

```typescript
// utils/error-handler.ts
export class IDOError extends Error {
  constructor(
    message: string,
    public code: string,
    public txHash?: string
  ) {
    super(message)
    this.name = 'IDOError'
  }
}

export function handleContractError(error: any): never {
  // 解析合约错误
  if (error.message?.includes('ZeroAddress')) {
    throw new IDOError('地址不能为零地址', 'ZERO_ADDRESS')
  }
  
  if (error.message?.includes('AddressAlreadyWhitelisted')) {
    throw new IDOError('地址已在白名单中', 'ALREADY_WHITELISTED')
  }
  
  if (error.message?.includes('IDONotInProgress')) {
    throw new IDOError('IDO未在进行中', 'IDO_NOT_ACTIVE')
  }
  
  if (error.message?.includes('AlreadyParticipated')) {
    throw new IDOError('已经参与过IDO', 'ALREADY_PARTICIPATED')
  }
  
  if (error.message?.includes('L0CannotParticipate')) {
    throw new IDOError('L0级别用户不能参与购买', 'L0_CANNOT_PARTICIPATE')
  }
  
  // isValidReferrer 字符串错误
  if (error.message?.includes('Referrer is zero address')) {
    throw new IDOError('推荐人地址不能为空', 'REFERRER_ZERO_ADDRESS')
  }
  
  if (error.message?.includes('Self referral not allowed')) {
    throw new IDOError('不能推荐自己', 'SELF_REFERRAL')
  }
  
  if (error.message?.includes('Referrer is not whitelisted')) {
    throw new IDOError('推荐人必须在白名单中', 'REFERRER_NOT_WHITELISTED')
  }
  
  if (error.message?.includes('Referrer must be higher level')) {
    throw new IDOError('推荐人级别必须更高', 'REFERRER_LEVEL_TOO_LOW')
  }
  
  if (error.message?.includes('Referrer must be whitelisted or have participated')) {
    throw new IDOError('推荐人必须在白名单中或已参与IDO', 'REFERRER_NOT_QUALIFIED')
  }
  
  // 通用错误
  throw new IDOError(
    error.message || '操作失败',
    'UNKNOWN_ERROR',
    error.transactionHash
  )
}

// 使用示例
export async function safeParticipateInIDO(referrer: `0x${string}`) {
  try {
    return await participateInIDO(referrer)
  } catch (error) {
    handleContractError(error)
  }
}
```

### 用户友好的错误提示

```typescript
export function getErrorMessage(error: IDOError): string {
  const messages: Record<string, string> = {
    'ZERO_ADDRESS': '请提供有效的钱包地址',
    'ALREADY_WHITELISTED': '该地址已在白名单中，无需重复添加',
    'IDO_NOT_ACTIVE': 'IDO当前未开放，请等待开始时间',
    'ALREADY_PARTICIPATED': '您已经参与过此次IDO，每个地址只能参与一次',
    'L0_CANNOT_PARTICIPATE': 'L0级别用户为核心团队成员，仅可推荐不可购买',
    
    // isValidReferrer 相关错误
    'REFERRER_ZERO_ADDRESS': '请输入有效的推荐人地址',
    'SELF_REFERRAL': '不能推荐自己',
    'REFERRER_NOT_WHITELISTED': '推荐人必须在白名单中',
    'REFERRER_LEVEL_TOO_LOW': '推荐人级别必须高于您的级别',
    'REFERRER_NOT_QUALIFIED': '推荐人必须在白名单中或已参与过IDO',
    
    'INSUFFICIENT_BALANCE': 'USDT余额不足，需要至少330 USDT',
    'INSUFFICIENT_ALLOWANCE': '请先授权IDO合约使用您的USDT'
  }
  
  return messages[error.code] || error.message || '操作失败，请重试'
}
```

## Gas优化建议

### 批量操作优化

```typescript
// 优化白名单批量添加
export async function optimizedBatchAdd(
  accounts: `0x${string}`[],
  level: WhitelistLevel,
  batchSize: number = 50
): Promise<`0x${string}`[]> {
  const txHashes: `0x${string}`[] = []
  
  // 分批处理，避免Gas限制
  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize)
    const hash = await batchAddToWhitelist(batch, level)
    txHashes.push(hash)
    
    // 等待确认再继续下一批
    await publicClient.waitForTransactionReceipt({ hash })
  }
  
  return txHashes
}
```

### Gas预估

```typescript
export async function estimateParticipateGas(
  referrer: `0x${string}`
): Promise<bigint> {
  return await publicClient.estimateContractGas({
    address: contracts.ido,
    abi: idoAbi,
    functionName: 'participateInIDO',
    args: [referrer],
    account: walletClient.account
  })
}
```

## 应用集成示例

### 主应用入口

```tsx
// App.tsx
import React from 'react'
import { AppKitProvider } from './providers/AppKitProvider'
import { WalletConnect } from './components/WalletConnect'
import { IDOInfo } from './components/IDOInfo'
import { ParticipateIDO } from './components/ParticipateIDO'

function App() {
  return (
    <AppKitProvider>
      <div className="app">
        <header>
          <h1>DeFi IDO Platform</h1>
          <WalletConnect />
        </header>
        
        <main>
          <IDOInfo refreshInterval={10000} />
          <ParticipateIDO 
            onSuccess={(txHash) => {
              console.log('IDO参与成功:', txHash)
              alert(`参与成功! 交易哈希: ${txHash}`)
            }}
            onSignature={(signature) => {
              console.log('用户签名:', signature)
            }}
          />
        </main>
      </div>
    </AppKitProvider>
  )
}

export default App
```

### CSS 样式建议

```css
/* styles/invite-records.css */
.invite-records-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.stats {
  font-size: 14px;
  opacity: 0.9;
}

.table-content {
  position: relative;
}

.table-content table {
  width: 100%;
  border-collapse: collapse;
}

.table-content th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.table-content td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
}

.table-content tr:hover {
  background: #f8f9fa;
}

.address {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.no-records {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.page-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background: #0056b3;
}

.page-info {
  font-size: 14px;
  color: #495057;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6c757d;
}

/* styles/wallet.css */
.wallet-connected {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
}

.connect-wallet-btn {
  padding: 12px 24px;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.connect-wallet-btn:hover {
  background: #0284c7;
}

.steps {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  padding: 0 10px;
}

.step {
  padding: 8px 16px;
  border-radius: 20px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
}

.step.active {
  background: #3b82f6;
  color: white;
}

.step.completed {
  background: #10b981;
  color: white;
}

.signing-status {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  text-align: center;
}

.ido-info {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}
```

## 总结

通过本指南，开发者可以：

1. **快速集成**：使用viem.sh和Reown AppKit的类型安全API
2. **完整功能**：覆盖钱包连接、签名验证和IDO系统的所有功能
3. **最佳实践**：错误处理、Gas优化、事件监听、签名安全
4. **用户体验**：友好的错误提示、步骤指示和状态展示
5. **实时更新**：通过事件监听实现实时数据更新
6. **安全保障**：消息签名验证确保操作安全性

### 关键特性
- 🔒 **安全性**：完整的权限检查、参数验证和签名验证
- ⚡ **性能**：批量操作和Gas优化
- 🎯 **类型安全**：全面的TypeScript支持
- 📊 **实时性**：事件监听和状态更新
- 🛠 **可维护**：清晰的代码结构和错误处理
- 🔗 **钱包集成**：支持多种钱包和WalletConnect协议
- ✍️ **签名验证**：Message签名确保操作合法性
- 🎨 **用户界面**：完整的React组件和交互流程

### 钱包和签名功能

- **多钱包支持**：通过Reown AppKit支持MetaMask、WalletConnect等
- **网络切换**：自动检测并引导用户切换到BSC网络
- **签名流程**：参与IDO前需要签名验证身份
- **步骤指导**：清晰的5步操作流程
- **错误处理**：针对签名拒绝、网络错误等的专门处理
- **安全机制**：签名时效性检查和一次性消费验证

### 5. 推荐记录分页查询

#### 使用新的分页功能优化大型推荐网络查询

```typescript
// components/InviteRecordsList.tsx
import React, { useState, useEffect } from 'react'
import { getInviteRecordsPaginated, getInviteRecordsOptimal } from '../services/ido-query'

interface InviteRecordsListProps {
  referrer: `0x${string}`
  pageSize?: number
  className?: string
}

export function InviteRecordsList({ 
  referrer, 
  pageSize = 10, 
  className = '' 
}: InviteRecordsListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [records, setRecords] = useState<{
    invitees: `0x${string}`[]
    total: number
    hasMore: boolean
    totalPages: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async (page: number) => {
    setLoading(true)
    setError(null)
    
    try {
      // 使用优化的查询函数，自动选择最佳查询方式
      const result = await getInviteRecordsOptimal(referrer, page, pageSize)
      setRecords(result)
    } catch (err) {
      console.error('获取推荐记录失败:', err)
      setError('获取推荐记录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (referrer) {
      fetchRecords(currentPage)
    }
  }, [referrer, currentPage, pageSize])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className={`invite-records-list loading ${className}`}>
        <div className="loading-spinner">📋 加载推荐记录中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`invite-records-list error ${className}`}>
        <div className="error-message">❌ {error}</div>
        <button onClick={() => fetchRecords(currentPage)}>重试</button>
      </div>
    )
  }

  if (!records || records.total === 0) {
    return (
      <div className={`invite-records-list empty ${className}`}>
        <div className="empty-message">📭 该地址还没有推荐任何人</div>
      </div>
    )
  }

  return (
    <div className={`invite-records-list ${className}`}>
      {/* 统计信息 */}
      <div className="records-header">
        <h3>推荐记录</h3>
        <div className="stats">
          <span>总计推荐: {records.total} 人</span>
          <span>当前页: {currentPage}/{records.totalPages}</span>
        </div>
      </div>

      {/* 推荐列表 */}
      <div className="records-list">
        {records.invitees.map((invitee, index) => (
          <div key={`${invitee}-${index}`} className="record-item">
            <span className="index">#{(currentPage - 1) * pageSize + index + 1}</span>
            <span className="address">{invitee}</span>
            <span className="short-address">
              {`${invitee.slice(0, 6)}...${invitee.slice(-4)}`}
            </span>
          </div>
        ))}
      </div>

      {/* 分页控制 */}
      {records.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: records.totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === records.totalPages || 
                Math.abs(page - currentPage) <= 2
              )
              .map((page, index, arr) => (
                <React.Fragment key={page}>
                  {index > 0 && arr[index - 1] !== page - 1 && (
                    <span className="ellipsis">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage ? 'active' : ''}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))
            }
          </div>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === records.totalPages}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
```

#### 分页查询最佳实践

```typescript
// services/invite-records-service.ts
import { getInviteRecordsPaginated } from './ido-query'

/**
 * 推荐记录查询服务类
 */
export class InviteRecordsService {
  private cache = new Map<string, {
    data: any
    timestamp: number
    ttl: number
  }>()

  /**
   * 带缓存的推荐记录查询
   */
  async getRecordsWithCache(
    referrer: `0x${string}`,
    page: number = 1,
    pageSize: number = 10,
    cacheTtl: number = 60000 // 1分钟缓存
  ) {
    const cacheKey = `${referrer}-${page}-${pageSize}`
    const cached = this.cache.get(cacheKey)
    
    // 检查缓存
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    // 查询数据
    const data = await getInviteRecordsPaginated(
      referrer, 
      (page - 1) * pageSize, 
      pageSize
    )

    // 存储缓存
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: cacheTtl
    })

    return data
  }

  /**
   * 批量查询多个推荐人的记录
   */
  async getBatchRecords(
    referrers: `0x${string}`[],
    pageSize: number = 10
  ) {
    const promises = referrers.map(async (referrer) => {
      try {
        const result = await getInviteRecordsPaginated(referrer, 0, pageSize)
        return { referrer, ...result }
      } catch (error) {
        console.error(`查询 ${referrer} 的推荐记录失败:`, error)
        return { 
          referrer, 
          invitees: [], 
          total: 0, 
          hasMore: false 
        }
      }
    })

    return await Promise.all(promises)
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * 清除过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= value.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// 导出服务实例
export const inviteRecordsService = new InviteRecordsService()

// 定期清理过期缓存
setInterval(() => {
  inviteRecordsService.cleanExpiredCache()
}, 300000) // 每5分钟清理一次
```

#### 性能优化建议

1. **合理设置页大小**
   ```typescript
   // 推荐的页大小设置
   const PAGE_SIZE_OPTIONS = {
     mobile: 5,      // 移动端较小
     tablet: 10,     // 平板中等
     desktop: 20,    // 桌面端较大
     admin: 50       // 管理后台最大
   }
   ```

2. **使用虚拟滚动处理大列表**
   ```typescript
   // 对于超大型推荐网络，考虑使用虚拟滚动
   import { FixedSizeList as List } from 'react-window'
   
   function VirtualizedInviteList({ referrer }: { referrer: string }) {
     // 实现虚拟滚动逻辑
   }
   ```

3. **智能预加载**
   ```typescript
   // 预加载下一页数据
   useEffect(() => {
     if (records?.hasMore && currentPage > 1) {
       // 在后台预加载下一页
       getInviteRecordsPaginated(referrer, currentPage * pageSize, pageSize)
         .catch(() => {}) // 静默失败
     }
   }, [currentPage, records])
   ```

---

**文档版本**: v1.2  
**最后更新**: 2025-01-15  
**维护者**: DeFi Team  
**相关文档**: [IDO API参考](../api/ido-api-reference.md)

## 更新日志

### v1.3 (2025-01-15)
- 🔄 **重构**: 将 `getInviteRecords` 函数改为分页版本，移除旧的非分页版本
- 📊 简化 API 设计：统一使用分页接口，向后兼容性通过参数控制
- 🚀 优化 `InviteRecordsService` 服务类，统一使用新的分页接口
- 📝 更新所有文档和示例代码使用新的函数签名
- 🎯 简化 `getInviteRecordsOptimal` 实现，统一调用分页接口

### v1.2 (2025-01-15)
- ✨ 新增 `getInviteRecordsPaginated` 分页查询功能
- 📊 添加推荐记录分页组件 `InviteRecordsList`
- 🚀 提供 `InviteRecordsService` 服务类支持缓存和批量查询
- 📝 添加分页查询最佳实践和性能优化建议
- 🎯 新增 `getInviteRecordsOptimal` 智能查询函数
- 🔧 更新 TypeScript 类型定义支持分页返回值

### v1.1 (2025-01-15)
- ✨ 新增 `isValidReferrer` 推荐人验证功能详细说明
- 🔧 更新 ABI 定义支持新的 `isValidReferrer(address, address)` 函数签名
- 📝 添加推荐人验证规则和错误处理文档
- 🎨 新增 `ReferrerValidation` React 组件示例
- 🛠 更新 `hasParticipated` 函数返回时间戳而非布尔值
- 📚 完善错误处理和用户友好的错误信息映射
- 🔍 添加实时推荐人验证 Hook 和防抖功能

### v1.0 (2025-01-14)
- 🎉 初始版本发布
- 📖 完整的 viem.sh 集成指南
- 🔗 钱包连接和签名验证功能