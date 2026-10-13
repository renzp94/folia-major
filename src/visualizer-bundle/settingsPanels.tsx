import React from 'react';
import {
  VISUALIZER_BACKGROUND_REGISTRY,
  getVisualizerBackgroundRegistryEntry,
} from './backgroundRegistry';
import type {
  VisualizerBackgroundQuickControlsProps,
  VisualizerBackgroundSettingsProps,
} from '@/components/visualizer/backgrounds/definition';
// 面板文案是 i18n key；这里的 t 会去查 Folia 自带的中文词条（见 stubs/i18n.ts）。
import { useTranslation } from './stubs/i18n';
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

/** 有专门参数面板的模式（宿主据此决定是否显示"模式参数"区块）。 */
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
 * 面板渲染出错时别默默消失：React 遇到渲染期异常会卸掉整棵子树，容器只剩空白 ——
 * 在宿主里看起来就像"这个背景没有参数"。把错误摆出来，至少知道是谁的锅。
 */
class PanelBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const error = this.state.error;
      // 连堆栈一起给出来：产物是压缩过的，但行号能在源码里对回去，不然只能猜。
      const stack = String(error?.stack ?? '')
        .split('\n')
        .slice(0, 4)
        .join('\n');
      return React.createElement(
        'div',
        {
          style: {
            padding: '4px 0',
            fontSize: 11,
            lineHeight: 1.55,
            color: '#e5484d',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxHeight: 160,
            overflow: 'auto',
          },
        },
        `面板渲染失败：${String(error?.message ?? error)}\n${stack}`,
      );
    }
    return this.props.children;
  }
}

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
  const { t } = useTranslation();
  const Panel = PANELS[mode];
  if (!Panel) return null;
  const capitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
  const props: Record<string, unknown> = {
    t,
    isDaylight,
    theme,
    controlCardBg: 'transparent',
    rangeInputClass: '',
    [`${mode}Tuning`]: tuning,
    [`on${capitalized}TuningChange`]: onTuningChange,
  };
  return React.createElement(PanelBoundary, null, React.createElement(Panel, props));
};

// ── 背景设置（上游把背景也做成一套带面板的模式，与视觉模式平行）───────────────

export type FoliaBackgroundModeOption = { mode: string; label: string };

/** 可选背景模式（宿主据此渲染"背景"下拉）。默认是 latent。 */
export const listBackgroundModes = (): FoliaBackgroundModeOption[] =>
  VISUALIZER_BACKGROUND_REGISTRY.map((entry) => ({
    mode: entry.mode,
    label: entry.labelFallback || entry.mode,
  }));

export type FoliaBackgroundPanelProps = {
  mode: string;
  /** 该背景的配置（含 tuning）；宿主原样透传。 */
  config?: unknown;
  /** 上游面板用它回写配置；宿主只需给一个 patch 回调。 */
  actions?: unknown;
  isDaylight?: boolean;
  theme?: unknown;
};

/**
 * 按背景模式渲染上游的背景设置面板。
 * 上游把它放在 `entry.renderSettingsPanel`（有些背景没有，返回 null）。
 */
export const FoliaBackgroundPanel: React.FC<FoliaBackgroundPanelProps> = ({
  mode,
  config,
  actions,
  isDaylight = false,
  theme,
}) => {
  const { t } = useTranslation();
  const entry = getVisualizerBackgroundRegistryEntry(mode as never);
  if (!entry?.renderSettingsPanel) return null;
  const props = {
    config,
    actions,
    isDaylight,
    theme,
    t,
    controlCardBg: 'transparent',
    rangeInputClass: '',
  } as VisualizerBackgroundSettingsProps;
  return React.createElement(
    PanelBoundary,
    null,
    React.createElement(React.Fragment, null, entry.renderSettingsPanel(props)),
  );
};

export type FoliaBackgroundQuickControlsProps = {
  mode: string;
  /** 与 FoliaBackgroundPanel 同一份 config —— 渲染、设置面板、快捷控制共用。 */
  config?: unknown;
  actions?: unknown;
  isDaylight?: boolean;
  theme?: unknown;
};

/**
 * 背景行右侧的快捷控制。
 *
 * 上游把它挂在 `AppearanceSection` 里背景那一行的 `trailing` 位置：各背景自己提供一个
 * 可点击循环的芯片 —— 隐现是「像素 / 网格 / 混合」，漫游是「可读性叠色」开关，
 * 空是「完全空白」，通用是「添加封面色彩」，莫奈是版式切换。
 * 没有 `renderQuickControls` 的背景返回 null（那一行就只显示箭头和下拉）。
 */
export const FoliaBackgroundQuickControls: React.FC<FoliaBackgroundQuickControlsProps> = ({
  mode,
  config,
  actions,
  isDaylight = false,
  theme,
}) => {
  const { t } = useTranslation();
  const entry = getVisualizerBackgroundRegistryEntry(mode as never);
  if (!entry?.renderQuickControls) return null;
  const props = { config, actions, isDaylight, theme, t } as VisualizerBackgroundQuickControlsProps;
  return React.createElement(
    PanelBoundary,
    null,
    React.createElement(React.Fragment, null, entry.renderQuickControls(props)),
  );
};
