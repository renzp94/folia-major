import { motionValue, type MotionValue } from 'framer-motion';
import type { AudioBands } from '../../../types';

// 音频这几个是**可替换的**，不是恒为零 —— 见下面的 installAudioSources。
//
// 之所以不能只给零值单例：渲染链路有**两条**读音频的路径。
//   - VisualizerShell 从 props 读（宿主传进来的那份）
//   - 各视觉模式走 useVisualizerRendererModel，而它 import 的是**本模块**
// 只喂其中一条的结果是：背景跟着音频动，而柱形 / 三角那些模式元素纹丝不动（恒读 0）。
// 所以宿主挂载时把自己那份装进来，两条路径指向同一个对象。
export const currentTime = motionValue(0);
export const lyricCurrentTime = motionValue(0);
export let audioPower: MotionValue<number> = motionValue(0);
export const bass = motionValue(0);
export const lowMid = motionValue(0);
export const mid = motionValue(0);
export const vocal = motionValue(0);
export const treble = motionValue(0);
export const spectrum = motionValue(new Uint8Array(0));

export type StubAudioSources = {
  audioPower: MotionValue<number>;
  audioBands: AudioBands;
};

export let audioBands: AudioBands = { bass, lowMid, mid, vocal, treble, spectrum };

/** 宿主把自己那份音频信号装进来，让上面两条读法拿到同一个对象。 */
export const installAudioSources = (sources: StubAudioSources): void => {
  audioPower = sources.audioPower;
  audioBands = sources.audioBands;
};

export const playerBottomBarLiveOffset = motionValue(0);
