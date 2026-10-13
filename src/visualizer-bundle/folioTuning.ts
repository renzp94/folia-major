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
import {
  DEFAULT_CADENZA_TUNING,
  DEFAULT_CAPPELLA_TUNING,
  DEFAULT_CLADDAGH_TUNING,
  DEFAULT_CLASSIC_TUNING,
  DEFAULT_DIORAMA_TUNING,
  DEFAULT_FUME_TUNING,
  DEFAULT_LUMIERE_TUNING,
  DEFAULT_MONET_TUNING,
  DEFAULT_PARTITA_TUNING,
  DEFAULT_PENDOLO_TUNING,
  DEFAULT_SONNET_TUNING,
  DEFAULT_TEMPERA_TUNING,
  DEFAULT_TILT_TUNING,
} from '@/types';

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
 * 各模式的出厂参数。**必须补这一层**：设置面板回传的是局部更新（只含动过的键），
 * 而上游存的是完整对象 —— 直接透传的话渲染器会读到一堆 undefined。
 * 多数模式逐键 `?? DEFAULT` 能兜住，diorama 不行：它 `clamp(t.motionAmount, …)`
 * 算出 NaN，相机参数全成 NaN，画面直接不动。
 */
const DEFAULTS: Record<string, unknown> = {
  classic: DEFAULT_CLASSIC_TUNING,
  cadenza: DEFAULT_CADENZA_TUNING,
  partita: DEFAULT_PARTITA_TUNING,
  fume: DEFAULT_FUME_TUNING,
  claddagh: DEFAULT_CLADDAGH_TUNING,
  cappella: DEFAULT_CAPPELLA_TUNING,
  tilt: DEFAULT_TILT_TUNING,
  diorama: DEFAULT_DIORAMA_TUNING,
  monet: DEFAULT_MONET_TUNING,
  pendolo: DEFAULT_PENDOLO_TUNING,
  sonnet: DEFAULT_SONNET_TUNING,
  tempera: DEFAULT_TEMPERA_TUNING,
  lumiere: DEFAULT_LUMIERE_TUNING,
};

/**
 * 把某个模式的 tuning 合进渲染 props。与上游 applyVisualizerTuning 行为一致：
 * 没有适配器、或没给该模式的 tuning 时原样返回 props（即用出厂参数）。
 * 给过 tuning 时先补出厂值，再叠用户那份（见 DEFAULTS）。
 */
export const applyVisualizerTuning = (
  mode: string,
  props: VisualizerSharedProps,
  bundle?: VisualizerTuningBundle,
): VisualizerSharedProps => {
  const adapter = BY_MODE.get(mode);
  const saved = bundle?.[mode];
  if (!adapter || saved === undefined) return props;
  const defaults = DEFAULTS[mode];
  const tuning = defaults ? { ...(defaults as object), ...(saved as object) } : saved;
  return adapter.apply(props, tuning as never);
};

export const getVisualizerTuningModes = (): string[] => [...BY_MODE.keys()];

/** 某个模式从设置对象里读 tuning 时用的键名（host 侧做持久化时要用）。 */
export const getTuningSettingsKey = (mode: string): string | null =>
  BY_MODE.get(mode)?.settingsKey ?? null;
