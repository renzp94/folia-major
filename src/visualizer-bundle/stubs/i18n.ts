// 渲染链路原来只需要一个能给出 fallback 的 t，所以这里曾直接返回 key 末段 ——
// 结果是面板与快捷控制显示 "latentDisplayDithering" 这类英文标识符。
// 现在接上 Folia 自己的中文词条（`i18n/locales/zh-CN.ts` 是一个纯嵌套对象，
// 没有额外依赖，可以整份进 bundle）。找不到的词条仍按老规矩逐级兜底。
//
// 两件事必须分清楚：
//
// 1. **词条是空串 ≠ 词条不存在**。上游有几个词条的值就是 `''`（`ui.waitingForMusic`
//    在三个语言文件里都是空的），本意是「这种状态下不显示文字」。早先这里用
//    `if (text) return text`，把它们一并当成没找到，于是歌词页/壁纸在没播放时会
//    渲染出 `waitingForMusic` 这个键名本身。
// 2. **宿主可以覆盖文案**。读 globalThis 上的覆盖表（EchoMusic 插件设置里填的
//    「未播放文案」就写在这里）。命中覆盖就用覆盖 —— 哪怕覆盖成空串，那也是用户的
//    明确选择，不该再往下兜底。
import zhCN from '@/i18n/locales/zh-CN';

type TOptions = { defaultValue?: string; [key: string]: unknown } | string | undefined;

/** 宿主注入的文案覆盖表，键是 i18n key（如 `ui.waitingForMusic`）。 */
const OVERRIDES_KEY = '__FOLIA_I18N_OVERRIDES__';

const overrides = (): Record<string, string> => {
  const value = (globalThis as Record<string, unknown>)[OVERRIDES_KEY];
  return value && typeof value === 'object' ? (value as Record<string, string>) : {};
};

/** 查词条。返回 undefined 表示「没有这个词条」，返回 '' 表示「词条就是空」。 */
const lookup = (key: string): string | undefined => {
  const custom = overrides();
  if (Object.prototype.hasOwnProperty.call(custom, key)) return custom[key];

  let node: unknown = zhCN;
  for (const part of key.split('.')) {
    if (!node || typeof node !== 'object') return undefined;
    if (!Object.prototype.hasOwnProperty.call(node, part)) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
};

/**
 * 补上 i18next 的 `{{var}}` 插值 —— 桩此前只返回词条原文，于是带变量的词条会显示
 * 字面量（Tempera 的画布图片操作会渲染出「已导出 {{count}} 张图片」）。
 * 未提供的变量保留原样，与 i18next 的默认行为一致。
 */
const interpolate = (text: string, options?: TOptions): string => {
  if (!options || typeof options !== 'object') return text;
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, name: string) => {
    const value = (options as Record<string, unknown>)[name];
    return value === undefined || value === null ? match : String(value);
  });
};

const translate = (key: string, options?: TOptions): string => {
  if (typeof options === 'string') return options;
  // 上游的 i18next 遇到空 key 返回空串，不会抛。桩必须一样：某些面板会写
  // `t(LABEL_KEYS[tuning.someField])`，一旦那个字段缺了就会传进 undefined ——
  // 这里跟着抛的话，整块面板（连带快捷控制）会一起消失，且只在那种状态下复现。
  if (typeof key !== 'string' || key === '') {
    return (options && typeof options === 'object' && typeof options.defaultValue === 'string')
      ? options.defaultValue
      : '';
  }
  // 词条优先：面板里用的是 i18n key，有中文就显示中文。
  const text = lookup(key);
  if (text !== undefined) return interpolate(text, options);
  if (options && typeof options === 'object' && typeof options.defaultValue === 'string') {
    return interpolate(options.defaultValue, options);
  }
  // 实在没有：退到 key 末段，至少不会渲染出 "ui.backToHome" 这种原始键。
  const tail = key.split('.').pop();
  return tail ?? key;
};

export const useTranslation = () => ({
  t: translate,
  i18n: { language: 'zh-CN', changeLanguage: async () => undefined },
  ready: true,
});

export default { useTranslation, t: translate };
