export function formatWalletAddress(
  walletAddress: string,
  prefixLength: number = 6,
  suffixLength: number = 6
): string {
  // 确保钱包地址存在且长度足够大（前缀和后缀的总长度不超过钱包地址长度）
  if (!walletAddress || walletAddress.length < prefixLength + suffixLength) {
    return walletAddress // 返回原始地址，无法格式化
  }

  const prefix = walletAddress.substring(0, prefixLength) // 取前prefixLength位
  const suffix = walletAddress.substring(walletAddress.length - suffixLength) // 取后suffixLength位

  return `${prefix}...${suffix}` // 返回格式化后的地址
}

export const isETH = (address?: string | `0x${string}`) =>
  address?.toLowerCase() == '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
