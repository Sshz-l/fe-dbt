"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import idoABI from "@/abis/ido.json";
import { getContractAddress } from "@/config/networks";
import { useAccount } from "wagmi";

export const useReferrer = () => {
  const searchParams = useSearchParams();
  const [referrer, setReferrer] = useState<string | null>(null);
  const { address } = useAccount();

  // 从 URL 获取推荐人地址
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      setReferrer(ref);
    }
  }, [searchParams]);

  // 检查推荐人是否合法
  const { data, isLoading: checkingReferrer } = useReadContract({
    address: getContractAddress(),
    abi: idoABI,
    functionName: "isValidReferrer",
    args: [
      address,
      referrer ? referrer : "0x0000000000000000000000000000000000000000",
    ],
    query: {
      enabled: !!referrer,
    },
  });

  // 解析返回结果
  const validReferrerResult = data as [boolean, string] | undefined;

  // 获取推荐人状态
  const getReferrerStatus = useCallback(() => {
    if (!referrer) {
      return {
        isValid: false,
        message: "缺失推荐人",
        buttonDisabled: true,
        reason: "缺失推荐人地址",
      };
    }

    if (checkingReferrer) {
      return {
        isValid: false,
        message: "检查推荐人中...",
        buttonDisabled: true,
        reason: "正在验证推荐人",
      };
    }

    if (!validReferrerResult || !validReferrerResult[0]) {
      return {
        isValid: false,
        message: "需推荐人先认购",
        buttonDisabled: true,
        reason: validReferrerResult ? validReferrerResult[1] : "推荐人验证失败",
      };
    }

    return {
      isValid: true,
      message: "",
      buttonDisabled: false,
      reason: "",
    };
  }, [referrer, checkingReferrer, validReferrerResult]);

  return {
    referrer,
    isValidReferrer: validReferrerResult ? validReferrerResult[0] : false,
    checkingReferrer,
    getReferrerStatus,
  };
};
 