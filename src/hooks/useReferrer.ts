"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useReadContract, useAccount } from "wagmi";
import { getContractAddress } from "@/config/networks";
import idoABI from "@/abis/ido.json";

type ValidReferrerResult = [boolean, string];

export const useReferrer = () => {
  const searchParams = useSearchParams();
  const [referrer, setReferrer] = useState<string | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      setReferrer(ref);
    }
  }, [searchParams]);

  // 检查推荐人是否合法
  const { data: validReferrerResult, isLoading: checkingReferrer } = useReadContract({
    address: getContractAddress(),
    abi: idoABI,
    functionName: "isValidReferrer",
    args: [
      address || "0x0000000000000000000000000000000000000000",
      referrer || "0x0000000000000000000000000000000000000000",
    ],
    query: {
      enabled: !!referrer && !!address,
    },
  });

  // 获取推荐人状态
  const getReferrerStatus = useCallback(() => {
    if (!referrer) {
      return { isValid: false, message: "缺失推荐人", buttonDisabled: true, reason: "缺失推荐人地址" };
    }
    if (checkingReferrer) {
      return { isValid: false, message: "检查推荐人中...", buttonDisabled: true, reason: "正在验证推荐人" };
    }

    const result = validReferrerResult as ValidReferrerResult | undefined;
    if (!result || !result[0]) {
      return { 
        isValid: false, 
        message: "需推荐人先认购", 
        buttonDisabled: true, 
        reason: result ? result[1] : "推荐人验证失败" 
      };
    }
    return { isValid: true, message: "", buttonDisabled: false, reason: "" };
  }, [referrer, checkingReferrer, validReferrerResult]);

  const result = validReferrerResult as ValidReferrerResult | undefined;
  return { 
    referrer, 
    isValidReferrer: result ? result[0] : false, 
    checkingReferrer, 
    getReferrerStatus 
  };
};
 