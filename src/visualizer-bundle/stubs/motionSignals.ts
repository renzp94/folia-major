import { motionValue } from 'framer-motion';

// 全部为零值单例：静默态。渲染器的时钟与频谱来自 props，不读这里。
export const currentTime = motionValue(0);
export const lyricCurrentTime = motionValue(0);
export const audioPower = motionValue(0);
export const bass = motionValue(0);
export const lowMid = motionValue(0);
export const mid = motionValue(0);
export const vocal = motionValue(0);
export const treble = motionValue(0);
export const spectrum = motionValue(new Uint8Array(0));
export const audioBands = { bass, lowMid, mid, vocal, treble, spectrum };
export const playerBottomBarLiveOffset = motionValue(0);
