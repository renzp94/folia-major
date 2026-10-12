/**
 * 顶替上游 `components/visualizer/tuningRegistry`（见 vite config 的 alias）。
 *
 * 为什么整份顶替：上游每个模式的 tuning.ts 都从它取 defineVisualizerTuning，而那一份模块
 * 一被执行就会调 import.meta.glob（扫描同级各模式的 tuning.ts）—— 在插件的单文件产物里会被展开成一张
 * 模块表，其中部分条目运行时是 undefined，于是 bundle 一加载就抛
 * "Cannot read properties of undefined (reading 'default')"，整块皮肤变黑。
 *
 * 导出面必须与上游一致（上游的 VisualizerRenderer / definition 也从这个路径取符号），
 * 但全部退化为恒等实现 —— 我们真正的注册表在 folioTuning.ts，由 bundle 入口直接使用。
 */
export type VisualizerTuningBundle = Record<string, unknown>;

export const defineVisualizerTuning = <T,>(adapter: T): T => adapter;

export const applyVisualizerTuning = (
  _mode: string,
  props: unknown,
): unknown => props;

export const getVisualizerTuningModes = (): string[] => [];

export const collectVisualizerTunings = (): VisualizerTuningBundle => ({});

export const applyVisualizerTuningsToSettings = (): void => {};
