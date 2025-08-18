// 网络配置
const DEFAULT_TESTNET_CONTRACT = '0x2342bE8Bb502E980dE80A59a1cAe7ac3F4A1200D';
const DEFAULT_MAINNET_CONTRACT = '0x0000000000000000000000000000000000000000';

// 检查环境变量
const checkEnvVariables = () => {
  const isDev = process.env.NODE_ENV === 'development';
  console.log('Current Environment:', isDev ? 'Development' : 'Production');
  console.log('NEXT_PUBLIC_ENV:', process.env.NEXT_PUBLIC_ENV);
};

// 在开发环境下检查环境变量
if (process.env.NODE_ENV === 'development') {
  checkEnvVariables();
}

// 获取当前环境配置
const getEnvironmentConfig = () => {
  // 根据 NODE_ENV 判断是开发环境还是生产环境
  const isDev = process.env.NODE_ENV === 'development';
  
  // 开发环境使用测试网配置
  if (isDev) {
    return {
      env: 'testnet' as const,
      contractAddress: DEFAULT_TESTNET_CONTRACT,
      usdtAddress: DEFAULT_TESTNET_CONTRACT,
    };
  }
  
  // 生产环境根据 NEXT_PUBLIC_ENV 判断使用测试网还是主网
  const prodEnv = process.env.NEXT_PUBLIC_ENV === 'mainnet' ? 'mainnet' : 'testnet';
  return {
    env: prodEnv as 'testnet' | 'mainnet',
    contractAddress: prodEnv === 'mainnet' ? DEFAULT_MAINNET_CONTRACT : DEFAULT_TESTNET_CONTRACT,
    usdtAddress: prodEnv === 'mainnet' ? DEFAULT_MAINNET_CONTRACT : DEFAULT_TESTNET_CONTRACT,
  };
};

export const NETWORK_CONFIG = {
  // 测试环境 - BSC测试网
  testnet: {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://testnet.bscscan.com',
    contractAddress: DEFAULT_TESTNET_CONTRACT,
    usdtAddress: DEFAULT_TESTNET_CONTRACT,
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
    contractAddress: DEFAULT_MAINNET_CONTRACT,
    usdtAddress: DEFAULT_MAINNET_CONTRACT,
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
  const config = getEnvironmentConfig();
  return config.env;
};

// 获取当前网络配置
export const getCurrentNetworkConfig = () => {
  const env = getCurrentNetworkEnv();
  const baseConfig = NETWORK_CONFIG[env];
  const envConfig = getEnvironmentConfig();

  // 合并配置，优先使用环境特定的合约地址
  return {
    ...baseConfig,
    contractAddress: envConfig.contractAddress,
    usdtAddress: envConfig.usdtAddress,
  };
};

// 获取合约地址
export const getContractAddress = (): `0x${string}` => {
  const config = getCurrentNetworkConfig();
  return config.contractAddress as `0x${string}`;
};

export const getUSDTAddress = (): `0x${string}` => {
  const config = getCurrentNetworkConfig();
  return config.usdtAddress as `0x${string}`;
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