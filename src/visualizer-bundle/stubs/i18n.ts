// 渲染链路只需要一个能给出 fallback 的 t；Folia 的完整 i18n 配置不进 bundle。
type TOptions = { defaultValue?: string } | string | undefined;

const translate = (key: string, options?: TOptions): string => {
  if (typeof options === 'string') return options;
  if (options && typeof options === 'object' && typeof options.defaultValue === 'string') {
    return options.defaultValue;
  }
  // 键名最后一段兜底，至少不会渲染出 "ui.backToHome" 这种原始键
  const tail = key.split('.').pop();
  return tail ?? key;
};

export const useTranslation = () => ({
  t: translate,
  i18n: { language: 'zh-CN', changeLanguage: async () => undefined },
  ready: true,
});

export default { useTranslation, t: translate };
