import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { MotionValue } from 'framer-motion';
import { getEntry } from './registry';
import { applyVisualizerTuning, type VisualizerTuningBundle } from './folioTuning';
import '@/index.css';

export { applyVisualizerTuning, getVisualizerTuningModes, getTuningSettingsKey } from './folioTuning';
import {
  FoliaBackgroundPanel,
  FoliaModePanel,
  type FoliaBackgroundPanelProps,
  type FoliaModePanelProps,
} from './settingsPanels';
export {
  FoliaModePanel,
  listPanelModes,
  FoliaBackgroundPanel,
  listBackgroundModes,
  type FoliaModePanelProps,
  type FoliaBackgroundPanelProps,
} from './settingsPanels';

export type VisualizerBundleProps = {
  mode: string;
  currentTime: MotionValue<number>;
  currentLineIndex: number;
  lines: unknown[];
  theme: unknown;
  audioPower: MotionValue<number>;
  audioBands: unknown;
  showText?: boolean;
  onLyricLineSeek?: (lyricTimeSec: number) => void;
  background?: { transparent?: boolean; mode?: string };
  /** 各模式的 tuning：{ [mode]: tuning }。缺省即用该模式的出厂参数。 */
  visualizerTunings?: VisualizerTuningBundle;
};

// 用 createElement 而不是 JSX：本文件按计划是 .ts（非 .tsx），JSX 不会被解析。
const BundleRenderer: React.FC<VisualizerBundleProps> = ({ mode, ...props }) => {
  // 与上游 VisualizerRenderer 一致：先把该模式的 tuning 合进 props，再交给模式渲染器。
  // 不传 tuning 时原样透传（＝出厂参数）——这曾是观感与原版有差距的原因之一。
  const resolved = applyVisualizerTuning(mode, props as never, props.visualizerTunings);
  return React.createElement(
    // entry.render 里包着 React.lazy，Suspense 边界是必需的（见 definition.ts 的说明）
    React.Suspense,
    { fallback: null },
    getEntry(mode).render(resolved as never),
  );
};

let root: Root | null = null;
let rootEl: HTMLElement | null = null;

export const mountVisualizer = (el: HTMLElement, props: VisualizerBundleProps): void => {
  // 复用已有 root：宿主每前进一行就调一次本函数，若每次 createRoot 会反复销毁
  // 重建整棵 React 树（动画重来、后续 WebGL 模式上下文 churn）。容器换了才重建。
  if (!root || rootEl !== el) {
    unmountVisualizer();
    root = createRoot(el);
    rootEl = el;
  }
  root.render(React.createElement(BundleRenderer, props));
};

export const unmountVisualizer = (): void => {
  root?.unmount();
  root = null;
  rootEl = null;
};

// 设置面板用的独立 React root —— 与视觉内容分开，互不干扰（面板可能在视觉未挂载时就打开）。
let panelRoot: Root | null = null;
let panelEl: HTMLElement | null = null;

export const mountModePanel = (el: HTMLElement, props: FoliaModePanelProps): void => {
  if (!panelRoot || panelEl !== el) {
    panelRoot?.unmount();
    panelRoot = createRoot(el);
    panelEl = el;
  }
  panelRoot.render(React.createElement(FoliaModePanel, props));
};

export const unmountModePanel = (): void => {
  panelRoot?.unmount();
  panelRoot = null;
  panelEl = null;
};

// 背景设置面板用另一个独立 root（两套设置可能同时打开）。
let bgPanelRoot: Root | null = null;
let bgPanelEl: HTMLElement | null = null;

export const mountBackgroundPanel = (el: HTMLElement, props: FoliaBackgroundPanelProps): void => {
  if (!bgPanelRoot || bgPanelEl !== el) {
    bgPanelRoot?.unmount();
    bgPanelRoot = createRoot(el);
    bgPanelEl = el;
  }
  bgPanelRoot.render(React.createElement(FoliaBackgroundPanel, props));
};

export const unmountBackgroundPanel = (): void => {
  bgPanelRoot?.unmount();
  bgPanelRoot = null;
  bgPanelEl = null;
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
