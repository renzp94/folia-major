import React from 'react';

// 背景层的注册表（`backgrounds/registry.tsx`）用 import.meta.glob 发现全部背景 entry，
// 会连带拉进 latent/monet/nomand/sora/url 这些着色器实现。阶段一不需要它们：
// 背景层整体置空，classic 的歌词排版照常渲染（宿主自带背景）。
const VisualizerBackgroundRenderer: React.FC<unknown> = () => null;

export default VisualizerBackgroundRenderer;
