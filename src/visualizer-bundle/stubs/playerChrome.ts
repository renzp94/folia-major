// 宿主播放器 chrome 设置：bundle 无 chrome，全部取默认值（关）。
//
// 真实模块是一个 zustand store，消费方按 `usePlayerChromeSettingsStore(state => state.xxx)`
// 取值，所以桩要能接受并执行 selector，否则返回的对象会把所有读取都变成 truthy。
const state = {
  hidePlayerProgressBar: false,
  hidePlayerRightPanelButton: false,
  alwaysShowPlayerBackButton: false,
  alwaysShowTrackSwitchButtons: false,
  alwaysShowMainWindowTitlebar: false,
  hideFullscreenButton: false,
  transparentPlayerBackground: false,
  enablePlayerPageNativeBlur: false,
  autoHidePlayerChrome: false,
  autoHideCursorWithPlayerChrome: true,
  showOpenPanelCloseButton: true,
};

export const usePlayerChromeSettingsStore = <T,>(selector?: (s: typeof state) => T): T | typeof state =>
  selector ? selector(state) : state;
