export interface NativeController {
  destroy: () => void;
}

export function attachNative(video: HTMLVideoElement, src: string): NativeController {
  video.src = src;
  video.load();

  return {
    destroy: () => {
      video.removeAttribute("src");
      video.load();
    },
  };
}
