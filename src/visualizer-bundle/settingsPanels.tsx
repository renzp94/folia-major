import React from 'react';
// 共享面板文件里放着 7 个模式的面板
import {
  ClassicSettingsPanel,
  PartitaSettingsPanel,
  FumeSettingsPanel,
  CappellaSettingsPanel,
  TiltSettingsPanel,
  DioramaSettingsPanel,
  CladdaghSettingsPanel,
} from '@/components/visualizer/settingsPanels';
// 其余 5 个模式各自目录里带一个面板
import LumiereSettingsPanel from '@/components/visualizer/lumiere/LumiereSettingsPanel';
import { MonetSettingsPanel } from '@/components/visualizer/monet/MonetSettingsPanel';
import PendoloSettingsPanel from '@/components/visualizer/pendolo/PendoloSettingsPanel';
import SonnetSettingsPanel from '@/components/visualizer/sonnet/SonnetSettingsPanel';
import TemperaSettingsPanel from '@/components/visualizer/tempera/TemperaSettingsPanel';

/** 模式 → 上游参数面板组件（cadenza / still 没有专门面板）。 */
const PANELS: Record<string, React.FC<never>> = {
  classic: ClassicSettingsPanel as never,
  partita: PartitaSettingsPanel as never,
  fume: FumeSettingsPanel as never,
  cappella: CappellaSettingsPanel as never,
  tilt: TiltSettingsPanel as never,
  diorama: DioramaSettingsPanel as never,
  claddagh: CladdaghSettingsPanel as never,
  lumiere: LumiereSettingsPanel as never,
  monet: MonetSettingsPanel as never,
  pendolo: PendoloSettingsPanel as never,
  sonnet: SonnetSettingsPanel as never,
  tempera: TemperaSettingsPanel as never,
};

/** 有专门参数面板的模式（宿主据此决定是否显示"模式参数"区块）。 */
export const listPanelModes = (): string[] => Object.keys(PANELS);

export type FoliaModePanelProps = {
  mode: string;
  /** 该模式当前的 tuning（未设置时传 undefined，面板会走出厂值）。 */
  tuning?: unknown;
  /** 面板请求变更时回调，参数是 tuning 的**部分**更新（Partial）。 */
  onTuningChange?: (patch: Record<string, unknown>) => void;
  isDaylight?: boolean;
  theme?: unknown;
};

/**
 * 按模式渲染 Folia 原版的参数面板。
 *
 * 上游面板的输入是一组**按模式命名**的 props（`classicTuning` / `onClassicTuningChange`…），
 * 这里按当前模式动态拼出来，于是宿主侧只需要"模式 + 当前 tuning + 变更回调"三项。
 * `t` 暂时返回原始 key（面板文案是 i18n key）；等接入真正的词条后再替换。
 */
export const FoliaModePanel: React.FC<FoliaModePanelProps> = ({
  mode,
  tuning,
  onTuningChange,
  isDaylight = false,
  theme,
}) => {
  const Panel = PANELS[mode];
  if (!Panel) return null;
  const capitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
  const props: Record<string, unknown> = {
    t: (key: string) => key,
    isDaylight,
    theme,
    controlCardBg: 'transparent',
    rangeInputClass: '',
    [`${mode}Tuning`]: tuning,
    [`on${capitalized}TuningChange`]: onTuningChange,
  };
  return React.createElement(Panel, props);
};
