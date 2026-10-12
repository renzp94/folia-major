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
