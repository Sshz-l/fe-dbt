const px2vh = (px: number): string => {
  return `${(px / 1080) * 100}vh`;
};

export default px2vh;
