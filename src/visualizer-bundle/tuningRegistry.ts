import cadenzaTuning from '@/components/visualizer/cadenza/tuning';
import cappellaTuning from '@/components/visualizer/cappella/tuning';
import claddaghTuning from '@/components/visualizer/claddagh/tuning';
import classicTuning from '@/components/visualizer/classic/tuning';
import dioramaTuning from '@/components/visualizer/diorama/tuning';
import fumeTuning from '@/components/visualizer/fume/tuning';
import lumiereTuning from '@/components/visualizer/lumiere/tuning';
import monetTuning from '@/components/visualizer/monet/tuning';
import partitaTuning from '@/components/visualizer/partita/tuning';
import pendoloTuning from '@/components/visualizer/pendolo/tuning';
import sonnetTuning from '@/components/visualizer/sonnet/tuning';
import temperaTuning from '@/components/visualizer/tempera/tuning';
import tiltTuning from '@/components/visualizer/tilt/tuning';
import type { VisualizerSharedProps } from '@/components/visualizer/definition';

// 手写替代上游的 components/visualizer/tuningRegistry.ts。
// 上游用 import.meta.glob('./*/tuning.ts') 发现适配器（插件构建绕不过去），而这些适配器
// 都是纯数据，显式 import 即可。**不能直接 import 上游那个模块**——它一被执行就会调 glob。
//
// 类型也自带一份：上游的 VisualizerTuningAdapter 定义在被 glob 污染的模块里。
interface TuningAdapter {
  mode: string;
  settingsKey: string;
  settingsSetterKey: string;
  apply: (props: VisualizerSharedProps, tuning: never) => VisualizerSharedProps;
}

/** 各模式的 tuning 集合：{ [mode]: tuning }。缺省即用该模式的出厂参数。 */
export type VisualizerTuningBundle = Record<string, unknown>;

const ADAPTERS: TuningAdapter[] = [
  classicTuning,
  cadenzaTuning,
  partitaTuning,
  fumeTuning,
  claddaghTuning,
  cappellaTuning,
  tiltTuning,
  dioramaTuning,
  monetTuning,
  pendoloTuning,
  sonnetTuning,
  temperaTuning,
  lumiereTuning,
] as TuningAdapter[];

const BY_MODE = new Map<string, TuningAdapter>();
for (const adapter of ADAPTERS) {
  if (BY_MODE.has(adapter.mode)) throw new Error(`duplicate tuning adapter: ${adapter.mode}`);
  BY_MODE.set(adapter.mode, adapter);
}

/**
 * 把某个模式的 tuning 合进渲染 props。与上游 applyVisualizerTuning 行为一致：
 * 没有适配器、或没给该模式的 tuning 时原样返回 props（即用出厂参数）。
 */
export const applyVisualizerTuning = (
  mode: string,
  props: VisualizerSharedProps,
  bundle?: VisualizerTuningBundle,
): VisualizerSharedProps => {
  const adapter = BY_MODE.get(mode);
  const tuning = bundle?.[mode];
  return adapter && tuning !== undefined ? adapter.apply(props, tuning as never) : props;
};

export const getVisualizerTuningModes = (): string[] => [...BY_MODE.keys()];

/** 某个模式从设置对象里读 tuning 时用的键名（host 侧做持久化时要用）。 */
export const getTuningSettingsKey = (mode: string): string | null =>
  BY_MODE.get(mode)?.settingsKey ?? null;
