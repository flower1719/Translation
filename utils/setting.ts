import { storage } from "wxt/utils/storage"

export interface TranslateProvider {
    llm: 'llm',
    memory: 'mymemory',
}
export interface UiSetting {
    enabled: boolean,
    sourceLang: string,
    targetLang: string,
}

export interface AppSetting {

    apiKey: string,
    apiUrl: string,
    model: string,
    provider: string;
}

export const DEFAULT_SETTINGS: AppSetting = {
    provider: 'mymemory',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    apiKey: '',
    model: 'deepseek-chat',
};

export const DEFAULT_UISETTINGS: UiSetting = {
    sourceLang: 'en',
    targetLang: 'zh-CN',
    enabled: true,
}

//声明在默认扩展空间
export const apiSettingsStorage = storage.defineItem<AppSetting>('local:api-setting', {
    fallback: DEFAULT_SETTINGS,
});

export const uiSettingsStorage = storage.defineItem<UiSetting>('local:ui-setting', {
    fallback: DEFAULT_UISETTINGS,
});

