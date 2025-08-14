// 原生代币
export const isEthAddress = (address?: string | `0x${string}`) =>
  address?.toLowerCase() ==
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase();
