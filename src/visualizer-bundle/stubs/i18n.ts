// 渲染链路原来只需要一个能给出 fallback 的 t，所以这里曾直接返回 key 末段 ——
// 结果是面板与快捷控制显示 "latentDisplayDithering" 这类英文标识符。
// 现在接上 Folia 自己的中文词条（`i18n/locales/zh-CN.ts` 是一个纯嵌套对象，
// 没有额外依赖，可以整份进 bundle）。找不到的词条仍按老规矩逐级兜底。
import zhCN from '@/i18n/locales/zh-CN';

type TOptions = { defaultValue?: string } | string | undefined;

const lookup = (key: string): string => {
  let node: unknown = zhCN;
  for (const part of key.split('.')) {
    if (!node || typeof node !== 'object') return '';
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : '';
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
  if (text) return text;
  if (options && typeof options === 'object' && typeof options.defaultValue === 'string') {
    return options.defaultValue;
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
