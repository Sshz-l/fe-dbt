export const locales = ['en', 'zh', 'tw', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  tw: '繁体中文',
  ko: '한국어',
};

// 语言包映射
export const messages = {
  en: {
    common: {
      connect: "Connect Wallet",
      disconnect: "Disconnect",
      loading: "Loading...",
      error: "Error",
      success: "Success"
    },
    header: {
      logo: "DBT Logo"
    },
    wallet: {
      status: "Status",
      connected: "Connected",
      disconnected: "Disconnected",
      account: "Account Address",
      balance: "Balance",
      send: "Send Transaction"
    }
  },
  zh: {
    common: {
      connect: "连接钱包",
      disconnect: "断开连接",
      loading: "加载中...",
      error: "错误",
      success: "成功"
    },
    header: {
      logo: "DBT 标志"
    },
    wallet: {
      status: "状态",
      connected: "已连接",
      disconnected: "未连接",
      account: "账户地址",
      balance: "余额",
      send: "发送交易"
    }
  },
  tw: {
    common: {
      connect: "連接錢包",
      disconnect: "斷開連接",
      loading: "載入中...",
      error: "錯誤",
      success: "成功"
    },
    header: {
      logo: "DBT 標誌"
    },
    wallet: {
      status: "狀態",
      connected: "已連接",
      disconnected: "未連接",
      account: "賬戶地址",
      balance: "餘額",
      send: "發送交易"
    }
  },
  ko: {
    common: {
      connect: "지갑 연결",
      disconnect: "연결 해제",
      loading: "로딩 중...",
      error: "오류",
      success: "성공"
    },
    header: {
      logo: "DBT 로고"
    },
    wallet: {
      status: "상태",
      connected: "연결됨",
      disconnected: "연결되지 않음",
      account: "계정 주소",
      balance: "잔액",
      send: "거래 보내기"
    }
  }
};

