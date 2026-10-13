import React from 'react';
import {
  DEFAULT_VISUALIZER_BACKGROUND_MODE,
  getVisualizerBackgroundRegistryEntry,
} from '../backgroundRegistry';
import type { VisualizerBackgroundRenderProps } from '@/components/visualizer/backgrounds/definition';

// 上游的 VisualizerBackgroundRenderer 只做两件事：读 config、派发给注册表里的模式。
// 它唯一的"不可移植"之处是 import 的 registry 用 import.meta.glob 发现背景 entry；
// 这里改用同目录下由我们手写的 backgroundRegistry（见 vite config 的 alias）。
//
// 与上游唯一的差别：外面多包一层带类名的定位容器。宿主侧需要把「背景自己的画布」
// 与其它组件的画布区分开（莫奈的底部音频轨也是 canvas，而且按自身尺寸绘制），
// 而 @paper-design/shaders 创建的 canvas 不带任何标记 —— 只能靠这层容器来限定。
const VisualizerBackgroundRenderer: React.FC<VisualizerBackgroundRenderProps> = (props) => {
  if (props.config?.transparent) {
    return null;
  }
  const mode = props.config?.mode ?? DEFAULT_VISUALIZER_BACKGROUND_MODE;
  return (
    <div className="absolute inset-0 folia-bg-layer">
      {getVisualizerBackgroundRegistryEntry(mode).render(props)}
    </div>
  );
};

export default VisualizerBackgroundRenderer;
