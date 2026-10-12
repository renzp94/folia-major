import commonBackground from '@/components/visualizer/backgrounds/common/entry';
import latentBackground from '@/components/visualizer/backgrounds/latent/entry';
import monetBackground from '@/components/visualizer/backgrounds/monet/entry';
import nomandBackground from '@/components/visualizer/backgrounds/nomand/entry';
import soraBackground from '@/components/visualizer/backgrounds/sora/entry';
import urlBackground from '@/components/visualizer/backgrounds/url/entry';
import type { VisualizerBackgroundRegistryEntry } from '@/components/visualizer/backgrounds/definition';
import type { VisualizerBackgroundMode } from '@/types';

// 手写替代上游的 backgrounds/registry.tsx —— 它用 import.meta.glob 发现背景 entry，
// 在插件的 library 构建里绕不过去，于是这份注册表由 alias 顶替（见 vite.visualizer-lib.config.ts）。
// 导出面必须与上游一致：VisualizerBackgroundRenderer 与 VisualizerRenderer 直接 import 这些符号。
const ENTRIES: VisualizerBackgroundRegistryEntry[] = [
  commonBackground,
  monetBackground,
  nomandBackground,
  latentBackground,
  urlBackground,
  soraBackground,
];

const BY_MODE = new Map<string, VisualizerBackgroundRegistryEntry>();
for (const entry of ENTRIES) {
  if (BY_MODE.has(entry.mode)) throw new Error(`duplicate background mode: ${entry.mode}`);
  BY_MODE.set(entry.mode, entry);
}

/** 与上游 `types/visualizerModes` 保持一致（默认是 latent，不是 common）。 */
export const DEFAULT_VISUALIZER_BACKGROUND_MODE: VisualizerBackgroundMode = 'latent';

export const VISUALIZER_BACKGROUND_REGISTRY = [...ENTRIES].sort((a, b) => a.order - b.order);

export const hasVisualizerBackgroundMode = (
  mode: unknown,
): mode is VisualizerBackgroundMode => typeof mode === 'string' && BY_MODE.has(mode);

export const getVisualizerBackgroundRegistryEntry = (mode: VisualizerBackgroundMode) =>
  BY_MODE.get(mode) ?? BY_MODE.get(DEFAULT_VISUALIZER_BACKGROUND_MODE)!;

export const getVisualizerBackgroundModeLabel = (
  mode: VisualizerBackgroundMode,
  t: (key: string) => string,
) => {
  const entry = getVisualizerBackgroundRegistryEntry(mode);
  const translated = t(entry.labelKey);
  return !translated || translated === entry.labelKey ? entry.labelFallback : translated;
};

// 上游这两个是 Folium mod 的运行时贡献通道；插件场景没有 mod，保持空实现以匹配导出面。
export const appendVisualizerBackgroundEntry = (): boolean => false;
export const removeVisualizerBackgroundEntry = (): boolean => false;
