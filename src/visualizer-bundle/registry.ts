import cadenzaEntry from '@/components/visualizer/cadenza/entry';
import cappellaEntry from '@/components/visualizer/cappella/entry';
import claddaghEntry from '@/components/visualizer/claddagh/entry';
import classicEntry from '@/components/visualizer/classic/entry';
import dioramaEntry from '@/components/visualizer/diorama/entry';
import fumeEntry from '@/components/visualizer/fume/entry';
import lumiereEntry from '@/components/visualizer/lumiere/entry';
import monetEntry from '@/components/visualizer/monet/entry';
import partitaEntry from '@/components/visualizer/partita/entry';
import pendoloEntry from '@/components/visualizer/pendolo/entry';
import sonnetEntry from '@/components/visualizer/sonnet/entry';
import stillEntry from '@/components/visualizer/still/entry';
import temperaEntry from '@/components/visualizer/tempera/entry';
import tiltEntry from '@/components/visualizer/tilt/entry';
import type { VisualizerRegistryEntry } from '@/components/visualizer/definition';

// 手写替代上游的 import.meta.glob('./*/entry.tsx')。
// entry 本身很小——真正各模式的 renderer 都被 React.lazy 包着；但插件的单文件加载约定
// （见 vite.visualizer-lib.config.ts 的 codeSplitting:false）会把它们全部内联进产物。
const ENTRIES: VisualizerRegistryEntry[] = [
  cadenzaEntry,
  cappellaEntry,
  claddaghEntry,
  classicEntry,
  dioramaEntry,
  fumeEntry,
  lumiereEntry,
  monetEntry,
  partitaEntry,
  pendoloEntry,
  sonnetEntry,
  stillEntry,
  temperaEntry,
  tiltEntry,
];

const BY_MODE = new Map<string, VisualizerRegistryEntry>();
for (const entry of ENTRIES) {
  if (BY_MODE.has(entry.mode)) throw new Error(`duplicate visualizer mode: ${entry.mode}`);
  BY_MODE.set(entry.mode, entry);
}

export const DEFAULT_MODE = 'classic';

/** 全部已注册模式的 id，按 entry 的 order 排序。 */
export const listModes = (): string[] =>
  [...BY_MODE.values()].sort((a, b) => a.order - b.order).map((entry) => entry.mode);

/** 模式 id + 展示名，供宿主侧设置面板列出可选项（无需自己去读 i18n）。 */
export const listModeLabels = (): { mode: string; label: string }[] =>
  [...BY_MODE.values()]
    .sort((a, b) => a.order - b.order)
    .map((entry) => ({ mode: entry.mode, label: entry.labelFallback || entry.mode }));

export const getEntry = (mode: string): VisualizerRegistryEntry =>
  BY_MODE.get(mode) ?? BY_MODE.get(DEFAULT_MODE)!;
