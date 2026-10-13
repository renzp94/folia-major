import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const src = path.resolve(__dirname, './src');
const stub = (name: string) => path.resolve(__dirname, './src/visualizer-bundle/stubs', name);

// library 构建：把 classic 渲染链路从 Folia 的 app 环境剥离成单文件自包含 ESM。
// 产物必须自包含（React/framer-motion 都打进去），所以不设 rollupOptions.external。
export default defineConfig({
  plugins: [react()],
  // 宿主渲染进程是隔离环境，没有 process / Node 全局。第三方库（framer-motion 等）会直接读
  // `process.env.NODE_ENV`，不替换掉就会在 import() 时抛 "process is not defined"。
  // 注意两者都要给：长键优先替换 NODE_ENV 为 "production"（否则会走 dev 分支），
  // 其余 `process.env.X` 落到空对象上为 undefined。
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '({})',
    global: 'globalThis',
  },
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
      // 下面两个**注册表模块本身**也必须换掉：只要产物里任何模块 import 了它们
      // （各模式入口、设置面板、VisualizerPresetGroup 等都会），import.meta.glob 展开出来的
      // 代码就会进产物，而它在运行时读 undefined 的模块 —— 症状是 bundle 一加载就抛
      // "Cannot read properties of undefined (reading 'default')"、整块皮肤变黑。
      {
        find: /^.*\/tuningRegistry$/,
        replacement: path.resolve(__dirname, './src/visualizer-bundle/tuningAdapterStub.ts'),
      },
      {
        find: /^.*\/backgrounds\/registry$/,
        replacement: path.resolve(__dirname, './src/visualizer-bundle/backgroundRegistry.tsx'),
      },
      // 视频层只在主应用界面挂载，但 static import 会把整条播放器 store 链拉进来
      { find: /^.*\/videoLayer\/VideoLayer$/, replacement: stub('videoLayer.tsx') },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
  build: {
    outDir: path.resolve(__dirname, '../echo-folia-plugin/folia'),
    emptyOutDir: true,
    cssCodeSplit: false,
    // 压缩不在这里配：vite 8 走 rolldown + oxc，顶层的 minify 只做变量改名、不压空白；
    // 而 'esbuild' 也已经不可用了（vite 不再内置它，要单独装）。真正的开关在
    // rollupOptions.output.minify —— 见下面的 { mangle, compress }。
    lib: {
      entry: path.resolve(__dirname, './src/visualizer-bundle/index.ts'),
      formats: ['es'],
      fileName: () => 'visualizer.js',
      cssFileName: 'visualizer',
    },
    rollupOptions: {
      // classic 的 renderer 是 React.lazy，默认会拆出独立 chunk；插件侧按单文件加载，
      // 必须把所有 chunk 内联进 visualizer.js。
      output: {
        codeSplitting: false,
        // mangle 改短变量名、compress 去空白与冗余。只写 minify: true 时 oxc 只做前者，
      // 产物仍是 19.8 万行 / 11.3 MB。
        minify: { mangle: true, compress: true },
      },
    },
  },
});
