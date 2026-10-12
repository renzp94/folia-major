import React from 'react';
import {
  DEFAULT_VISUALIZER_BACKGROUND_MODE,
  getVisualizerBackgroundRegistryEntry,
} from '../backgroundRegistry';
import type { VisualizerBackgroundRenderProps } from '@/components/visualizer/backgrounds/definition';

// 上游的 VisualizerBackgroundRenderer 只做两件事：读 config、派发给注册表里的模式。
// 它唯一的"不可移植"之处是 import 的 registry 用 import.meta.glob 发现背景 entry；
// 这里改用同目录下由我们手写的 backgroundRegistry（见 vite config 的 alias），
// 其余逻辑与上游逐行一致 —— 这样 Folia 的背景层（默认 latent）就能正常工作。
const VisualizerBackgroundRenderer: React.FC<VisualizerBackgroundRenderProps> = (props) => {
  if (props.config?.transparent) {
    return null;
  }
  const mode = props.config?.mode ?? DEFAULT_VISUALIZER_BACKGROUND_MODE;
  return <>{getVisualizerBackgroundRegistryEntry(mode).render(props)}</>;
};

export default VisualizerBackgroundRenderer;
