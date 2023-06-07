export function playSound(wavPath: string) {
  const audio = new Audio(wavPath);
  audio.crossOrigin = "anonymous";
  audio.play();
}
