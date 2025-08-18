// 合约配置
export const CONTRACT_CONFIG = {
  IDO_CONTRACT: {
    address: process.env.NEXT_PUBLIC_IDO_CONTRACT_ADDRESS as `0x${string}`,
    abi: 'ido.json'
  },
  USDT_CONTRACT: {
    address: process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS as `0x${string}`,
    abi: 'approve.json'
  }
};

// 网络配置
export const NETWORK_CONFIG = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '1',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
};

// 环境检查
export const validateContractConfig = () => {
  if (!process.env.NEXT_PUBLIC_IDO_CONTRACT_ADDRESS) {
    console.warn('⚠️ NEXT_PUBLIC_IDO_CONTRACT_ADDRESS 未设置');
  }
  if (!process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS) {
    console.warn('⚠️ NEXT_PUBLIC_USDT_CONTRACT_ADDRESS 未设置');
  }
}; 