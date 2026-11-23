import { storage } from "wxt/utils/storage"

export interface TranslateProvider {
    llm: 'llm',
    memory: 'mymemory',
}
export interface UiSetting {
    enabled: boolean,
    sourceLang: string,
    targetLang: string,
    hoverTranslateEnabled: boolean,
    hoverShortcut: string,
    maxTranslateLength: number,
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
    hoverTranslateEnabled: true,
    hoverShortcut: 'Shift+T',
    maxTranslateLength: 500,
};

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta']);

function normalizeKeyCode(code: string, key: string): string | null {
    if (MODIFIER_KEYS.has(key)) return null;
    if (code.startsWith('Key') && code.length === 4) {
        return code.slice(3).toUpperCase();
    }
    if (code.startsWith('Digit') && code.length === 6) {
        return code.slice(5);
    }
    if (/^F([1-9]|1[0-2])$/.test(code)) {
        return code;
    }
    if (code === 'Space') {
        return 'Space';
    }
    if (key.length === 1) {
        return key.toUpperCase();
    }
    return null;
}

export function formatShortcutEvent(event: KeyboardEvent): string | null {
    const mainKey = normalizeKeyCode(event.code, event.key);
    if (!mainKey) return null;

    const parts: string[] = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');

    // 至少需要一个修饰键，或使用 F1-F12 功能键，避免单字母误触
    if (parts.length === 0 && !/^F([1-9]|1[0-2])$/.test(mainKey)) {
        return null;
    }

    parts.push(mainKey);
    return parts.join('+');
}

export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
    const normalized = shortcut.trim();
    if (!normalized) return false;
    const pressed = formatShortcutEvent(event);
    return pressed !== null && pressed.toLowerCase() === normalized.toLowerCase();
}

//声明在默认扩展空间
export const apiSettingsStorage = storage.defineItem<AppSetting>('local:api-setting', {
    fallback: DEFAULT_SETTINGS,
});

export const uiSettingsStorage = storage.defineItem<UiSetting>('local:ui-setting', {
    fallback: DEFAULT_UISETTINGS,
});

