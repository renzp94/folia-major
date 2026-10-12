// bundle 永远不是 Folia 主应用界面：关掉 VideoLayer 与 Folium 舞台层。
//
// 导出名/类型必须与真实 `src/utils/appSurface.ts` 一致——消费方按值使用
// （`isMainAppSurface && <VideoLayer/>`），所以这里是布尔常量而不是函数。
export const isMainAppSurface = false;
export const isObsBrowserSourceSurface = false;
export const isRemoteControlSurface = false;
export const obsSourceKind: string | null = null;
