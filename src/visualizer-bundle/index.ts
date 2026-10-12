import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { MotionValue } from 'framer-motion';
import { getEntry } from './registry';
import '@/index.css';

export type VisualizerBundleProps = {
  mode: string;
  currentTime: MotionValue<number>;
  currentLineIndex: number;
  lines: unknown[];
  theme: unknown;
  audioPower: MotionValue<number>;
  audioBands: unknown;
  showText?: boolean;
  background?: { transparent: boolean };
};

// 用 createElement 而不是 JSX：本文件按计划是 .ts（非 .tsx），JSX 不会被解析。
const BundleRenderer: React.FC<VisualizerBundleProps> = ({ mode, ...props }) =>
  // entry.render 里包着 React.lazy，Suspense 边界是必需的（见 definition.ts 的说明）
  React.createElement(
    React.Suspense,
    { fallback: null },
    getEntry(mode).render(props as never),
  );

let root: Root | null = null;

export const mountVisualizer = (el: HTMLElement, props: VisualizerBundleProps): void => {
  unmountVisualizer();
  root = createRoot(el);
  root.render(React.createElement(BundleRenderer, props));
};

export const unmountVisualizer = (): void => {
  root?.unmount();
  root = null;
};

import { motionValue as fmMotionValue } from 'framer-motion';

/** 供宿主侧构造 MotionValue（插件环境没有 framer-motion）。 */
export const motionValue = fmMotionValue;

/** 构造一组全零的音频信号，作为无频谱时的安全降级。 */
export const createSilentAudio = () => ({
  audioPower: fmMotionValue(0),
  audioBands: {
    bass: fmMotionValue(0),
    lowMid: fmMotionValue(0),
    mid: fmMotionValue(0),
    vocal: fmMotionValue(0),
    treble: fmMotionValue(0),
    spectrum: fmMotionValue(new Uint8Array(0)),
  },
});
