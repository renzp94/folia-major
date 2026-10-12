import React from 'react';

// VisualizerShell 的 `<VideoLayer/>` 只在主应用界面挂载（appSurface 桩恒为 false），
// 但 static import 依然会把整条播放器 store 链（usePlaybackStore / useVideoLayerSettingsStore /
// i18n config）拉进 bundle。bundle 里没有视频层，直接换掉整个组件。
const VideoLayer: React.FC<unknown> = () => null;

export default VideoLayer;
