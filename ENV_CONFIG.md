# 环境配置说明

## 环境变量配置

在项目根目录创建 `.env.local` 文件，配置以下环境变量：

```bash
# 环境配置
NEXT_PUBLIC_ENV=testnet

# BSC 测试网配置
NEXT_PUBLIC_CONTRACT_ADDRESS_TESTNET=0x2342bE8Bb502E980dE80A59a1cAe7ac3F4A1200D
NEXT_PUBLIC_BSC_TESTNET_USDT_ADDRESS=0x725d6d1DA1Ac992cBa5c57aAE6deE5896663193D

# BSC 主网配置
NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BSC_MAINNET_USDT_ADDRESS=0x0000000000000000000000000000000000000000
```

## 网络配置说明

### BSC 测试网 (Testnet)
- **Chain ID**: 97
- **网络名称**: BSC Testnet
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545
- **浏览器**: https://testnet.bscscan.com
- **代币符号**: tBNB

### BSC 主网 (Mainnet)
- **Chain ID**: 56
- **网络名称**: BSC Mainnet
- **RPC URL**: https://bsc-dataseed1.binance.org
- **浏览器**: https://bscscan.com
- **代币符号**: BNB

## 环境判断逻辑

1. **开发环境** (`NODE_ENV=development`): 自动使用测试网配置
2. **生产环境**: 根据 `NEXT_PUBLIC_ENV` 环境变量决定
   - `NEXT_PUBLIC_ENV=testnet`: 使用测试网
   - `NEXT_PUBLIC_ENV=mainnet`: 使用主网

## 合约地址配置

- 测试网合约地址: `0x2342bE8Bb502E980dE80A59a1cAe7ac3F4A1200D`
- 主网合约地址: 需要配置实际的主网合约地址

## 使用方法

在代码中，`useIDOInfo` hook 会自动根据环境配置获取正确的：
- Chain ID
- 合约地址
- 网络配置
- RPC URL

无需手动切换网络，系统会根据环境自动选择正确的配置。 