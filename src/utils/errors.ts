import { BaseError } from 'wagmi';

export interface ContractError {
  name: string;
  message: string;
}

interface ErrorWithData extends BaseError {
  data?: {
    message?: string;
    [key: string]: unknown;
  };
}

export function getErrorMessage(error: unknown): string {
  // 如果是 wagmi 的 BaseError，使用其格式化的错误信息
  if (error instanceof BaseError) {
    // 尝试获取合约错误信息
    const contractError = getContractErrorMessage(error as ErrorWithData);
    if (contractError) {
      return contractError;
    }
    // 使用 BaseError 的格式化错误信息
    return error.shortMessage || error.message;
  }

  // 如果是标准 Error 对象
  if (error instanceof Error) {
    return error.message;
  }

  // 如果是字符串
  if (typeof error === 'string') {
    return error;
  }

  // 其他情况
  return 'An unknown error occurred';
}

function getContractErrorMessage(error: ErrorWithData): string | null {
  try {
    // 检查错误对象中是否包含合约错误信息
    const errorMessage = error.message;
    if (!errorMessage) return null;

    // 尝试提取合约错误信息
    // 1. 检查是否包含 revert 错误
    if (error.data?.message) {
      return error.data.message;
    }

    // 2. 检查是否包含 "execution reverted:" 或 "reverted with reason:"
    const revertedMatch = errorMessage.match(/(?:execution reverted:|reverted with reason:)\s*([^"}\n]+)/i);
    if (revertedMatch) {
      return revertedMatch[1].trim();
    }

    // 3. 检查是否包含 "custom error"
    const customErrorMatch = errorMessage.match(/custom error\s+([^:\n]+)/i);
    if (customErrorMatch) {
      return customErrorMatch[1].trim();
    }

    // 4. 检查是否包含 "reason string"
    const reasonMatch = errorMessage.match(/reason string\s*(?:"|'|`)([^"'`]+)(?:"|'|`)/i);
    if (reasonMatch) {
      return reasonMatch[1].trim();
    }

    return null;
  } catch (e) {
    console.error('Error parsing contract error:', e);
    return null;
  }
}

// 用于处理交易错误的工具函数
export function handleTransactionError(error: unknown): string {
  const errorMessage = getErrorMessage(error);
  
  // 处理一些常见的错误情况
  if (errorMessage.toLowerCase().includes('user rejected') || 
      errorMessage.toLowerCase().includes('user denied')) {
    return 'Transaction was rejected by user';
  }
  
  if (errorMessage.toLowerCase().includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }

  if (errorMessage.toLowerCase().includes('nonce too low')) {
    return 'Please try again with a new transaction';
  }

  if (errorMessage.toLowerCase().includes('gas required exceeds allowance') ||
      errorMessage.toLowerCase().includes('gas limit exceeded')) {
    return 'Transaction would exceed gas limit';
  }

  if (errorMessage.toLowerCase().includes('already pending')) {
    return 'A similar transaction is already pending. Please wait or speed up the pending transaction.';
  }

  if (errorMessage.toLowerCase().includes('network error')) {
    return 'Network connection error. Please check your connection and try again.';
  }

  return errorMessage;
}

// 用于处理读取合约错误的工具函数
export function handleReadContractError(error: unknown): string {
  const errorMessage = getErrorMessage(error);

  // 处理一些常见的读取错误情况
  if (errorMessage.toLowerCase().includes('contract not deployed')) {
    return 'Contract is not deployed on this network';
  }

  if (errorMessage.toLowerCase().includes('out of gas')) {
    return 'Contract read failed due to gas estimation';
  }

  if (errorMessage.toLowerCase().includes('network error')) {
    return 'Network connection error. Please check your connection and try again.';
  }

  if (errorMessage.toLowerCase().includes('invalid parameters')) {
    return 'Invalid parameters for contract call';
  }

  return errorMessage;
} 