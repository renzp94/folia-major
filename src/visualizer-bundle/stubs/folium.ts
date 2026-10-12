// Folium（Folia 的 mod 系统）不参与本 bundle：所有读取恒等。
export const useFoliumTunings = <T,>(_mode: string, identity: T): T => identity;
export const useFoliumCommands = () => [];
export const useFoliumStageLayers = () => [];
export const FoliumStageLayerSlot = () => null;
