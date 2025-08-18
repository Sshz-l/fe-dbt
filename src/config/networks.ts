// 网络配置
export const NETWORK_CONFIG = {
  // 测试环境 - BSC测试网
  testnet: {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://testnet.bscscan.com',
    contractAddress: process.env.NEXT_PUBLIC_BSC_TESTNET_CONTRACT_ADDRESS || '0x2342bE8Bb502E980dE80A59a1cAe7ac3F4A1200D',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://testnet.bscscan.com'],
  },
  
  // 正式环境 - BSC正式网
  mainnet: {
    chainId: 56,
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    explorer: 'https://bscscan.com',
    contractAddress: process.env.NEXT_PUBLIC_BSC_MAINNET_CONTRACT_ADDRESS || '',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://bscscan.com'],
  },
};

// 获取当前环境
export const getCurrentNetworkEnv = (): 'testnet' | 'mainnet' => {
  return (process.env.NEXT_PUBLIC_NETWORK_ENV as 'testnet' | 'mainnet') || 'testnet';
};

// 获取当前网络配置
export const getCurrentNetworkConfig = () => {
  const env = getCurrentNetworkEnv();
  return NETWORK_CONFIG[env];
};

// 获取合约地址
export const getContractAddress = (): string => {
  const config = getCurrentNetworkConfig();
  return config.contractAddress;
};

// 获取RPC URL
export const getRpcUrl = (): string => {
  const config = getCurrentNetworkConfig();
  return config.rpcUrl;
};

// 获取链ID
export const getChainId = (): number => {
  const config = getCurrentNetworkConfig();
  return config.chainId;
};

// 获取网络名称
export const getNetworkName = (): string => {
  const config = getCurrentNetworkConfig();
  return config.name;
};

// 获取浏览器URL
export const getExplorerUrl = (): string => {
  const config = getCurrentNetworkConfig();
  return config.explorer;
}; 