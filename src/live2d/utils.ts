export function setLive2dScale(wight: number, height: number): number {
  console.log("宽   " + wight, "高   " + height);
  // 根据宽高进行调整
  const scale = Math.max(
    wight / window.innerWidth,
    height / window.innerHeight
  );
  console.log("scale    " + scale);
  if (scale > 1) {
    return 1 / scale;
  } else if (scale <= 1) {
    return scale;
  }
}
