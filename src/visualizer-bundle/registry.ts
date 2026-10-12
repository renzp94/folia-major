import classicEntry from '@/components/visualizer/classic/entry';
import type { VisualizerRegistryEntry } from '@/components/visualizer/definition';

// 手写替代 import.meta.glob('./*/entry.tsx')：阶段一只注册 classic。
const ENTRIES: VisualizerRegistryEntry[] = [classicEntry];

const BY_MODE = new Map<string, VisualizerRegistryEntry>();
for (const entry of ENTRIES) {
  if (BY_MODE.has(entry.mode)) throw new Error(`duplicate visualizer mode: ${entry.mode}`);
  BY_MODE.set(entry.mode, entry);
}

export const DEFAULT_MODE = 'classic';

export const getEntry = (mode: string): VisualizerRegistryEntry =>
  BY_MODE.get(mode) ?? BY_MODE.get(DEFAULT_MODE)!;

export const listModes = (): string[] => [...BY_MODE.keys()];
