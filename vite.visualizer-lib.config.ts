import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const src = path.resolve(__dirname, './src');
const stub = (name: string) => path.resolve(__dirname, './src/visualizer-bundle/stubs', name);

// library 构建：把 classic 渲染链路从 Folia 的 app 环境剥离成单文件自包含 ESM。
// 产物必须自包含（React/framer-motion 都打进去），所以不设 rollupOptions.external。
export default defineConfig({
  plugins: [react()],
  // 不要 copy folia-major/public/（icon.svg、service worker 等）到插件产物目录
  publicDir: false,
  resolve: {
    // 顺序敏感：具体模块必须排在通用 @/ 规则之前。
    // Vite 用 `importee.replace(find, replacement)` 应用 alias，所以每条正则都锚定整条
    // specifier（^...$），否则只剩匹配片段被替换，会拼出坏路径。
    alias: [
      { find: /^react-i18next$/, replacement: stub('i18n.ts') },
      { find: /^.*\/stores\/motionSignals$/, replacement: stub('motionSignals.ts') },
      { find: /^.*\/utils\/appSurface$/, replacement: stub('appSurface.ts') },
      { find: /^.*\/stores\/usePlayerChromeSettingsStore$/, replacement: stub('playerChrome.ts') },
      // mods/folium 整棵子树（相对路径 `../../mods/folium/...` 与 `@/mods/folium/...` 都拦）
      { find: /^.*mods\/folium\/.+$/, replacement: stub('folium.ts') },
      // 背景注册表用 import.meta.glob 发现全部背景 entry，绕不过去就换掉整个渲染器
      { find: /^.*\/backgrounds\/VisualizerBackgroundRenderer$/, replacement: stub('backgroundRenderer.tsx') },
      // 视频层只在主应用界面挂载，但 static import 会把整条播放器 store 链拉进来
      { find: /^.*\/videoLayer\/VideoLayer$/, replacement: stub('videoLayer.tsx') },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
  build: {
    outDir: path.resolve(__dirname, '../echo-folia-plugin/folia'),
    emptyOutDir: true,
    cssCodeSplit: false,
    // Vite 8 用 oxc/rolldown 做压缩；esbuild 已不是自带依赖，指定它会报错。
    minify: 'oxc',
    lib: {
      entry: path.resolve(__dirname, './src/visualizer-bundle/index.ts'),
      formats: ['es'],
      fileName: () => 'visualizer.js',
      cssFileName: 'visualizer',
    },
    rollupOptions: {
      // classic 的 renderer 是 React.lazy，默认会拆出独立 chunk；插件侧按单文件加载，
      // 必须把所有 chunk 内联进 visualizer.js。
      output: { codeSplitting: false },
    },
  },
});
