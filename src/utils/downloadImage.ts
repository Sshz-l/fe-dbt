export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const downloadImage = (url: string, filename: string) => {
  // 如果是移动端，使用不同的保存策略
  if (isMobile()) {
    // 创建一个临时的 a 标签用于下载图片
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // PC端使用下载方式
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    });
};

export const generateInviteImage = async (inviteCode: string): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // 设置画布大小
  canvas.width = 750; // 移动端适配宽度
  canvas.height = 1334; // 适合的高度比例

  // 加载背景图
  const bgImage = new Image();
  bgImage.crossOrigin = 'anonymous';

  return new Promise((resolve) => {
    bgImage.onload = () => {
      // 绘制背景图
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      // 绘制二维码
      const qr = new Image();
      qr.crossOrigin = 'anonymous';
      qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `${window.location.origin}/treasure?invite_code=${inviteCode}`
      )}`;

      qr.onload = () => {
        // 在右下角绘制二维码
        const qrSize = 160;
        const qrX = canvas.width - qrSize - 40;
        const qrY = canvas.height - qrSize - 40;
        ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

        // 转换为图片URL
        resolve(canvas.toDataURL('image/png'));
      };
    };

    // 设置背景图片源
    bgImage.src = '/images/Invitation_CN.png';
  });
};
