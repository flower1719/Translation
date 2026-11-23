import {
  apiSettingsStorage,
  DEFAULT_UISETTINGS,
  formatShortcutEvent,
  uiSettingsStorage,
} from '../../utils/setting';

const enabledEl = document.getElementById('enabled') as HTMLInputElement;
const hoverTranslateEnabledEl = document.getElementById('hoverTranslateEnabled') as HTMLInputElement;
const hoverShortcutBoxEl = document.getElementById('hoverShortcutBox') as HTMLDivElement;
const hoverShortcutEl = document.getElementById('hoverShortcut') as HTMLInputElement;
const maxTranslateLengthEl = document.getElementById('maxTranslateLength') as HTMLInputElement;
const sourceLangEl = document.getElementById('sourceLang') as HTMLSelectElement;
const targetLangEl = document.getElementById('targetLang') as HTMLSelectElement;
const providerEl = document.getElementById('provider') as HTMLSelectElement;
const llmConfigEl = document.getElementById('llmConfig') as HTMLDivElement;
const apiUrlEl = document.getElementById('apiUrl') as HTMLInputElement;
const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;
const modelEl = document.getElementById('model') as HTMLInputElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

function toggleLlmFields() {
  llmConfigEl.style.display = providerEl.value === 'llm' ? 'block' : 'none';
}

function toggleHoverShortcutField() {
  hoverShortcutBoxEl.style.display = hoverTranslateEnabledEl.checked ? 'block' : 'none';
}

// 打开弹窗
async function loadSettings() {
  const [rawUiSettings, appsettings] = await Promise.all([
    uiSettingsStorage.getValue(),
    apiSettingsStorage.getValue(),
  ]);
  const uisettings = { ...DEFAULT_UISETTINGS, ...rawUiSettings };

  enabledEl.checked = uisettings.enabled;
  hoverTranslateEnabledEl.checked = uisettings.hoverTranslateEnabled;
  hoverShortcutEl.value = uisettings.hoverShortcut;
  maxTranslateLengthEl.value = String(uisettings.maxTranslateLength);
  sourceLangEl.value = uisettings.sourceLang;
  targetLangEl.value = uisettings.targetLang;

  providerEl.value = appsettings.provider;
  apiUrlEl.value = appsettings.apiUrl;
  apiKeyEl.value = appsettings.apiKey;
  modelEl.value = appsettings.model;

  toggleHoverShortcutField();
  toggleLlmFields();
}

// 录制悬停翻译快捷键
hoverShortcutEl.addEventListener('keydown', (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (event.key === 'Escape') {
    hoverShortcutEl.blur();
    return;
  }

  const shortcut = formatShortcutEvent(event);
  if (shortcut) {
    hoverShortcutEl.value = shortcut;
  }
});

// 点击保存
saveBtn.addEventListener('click', async () => {
  const parsedMaxLen = Number.parseInt(maxTranslateLengthEl.value, 10);
  const maxTranslateLength = Number.isFinite(parsedMaxLen)
    ? Math.min(10000, Math.max(10, parsedMaxLen))
    : DEFAULT_UISETTINGS.maxTranslateLength;
  maxTranslateLengthEl.value = String(maxTranslateLength);

  const hoverShortcut = hoverShortcutEl.value.trim() || DEFAULT_UISETTINGS.hoverShortcut;
  hoverShortcutEl.value = hoverShortcut;

  await Promise.all([
    uiSettingsStorage.setValue({
      enabled: enabledEl.checked,
      hoverTranslateEnabled: hoverTranslateEnabledEl.checked,
      hoverShortcut,
      maxTranslateLength,
      sourceLang: sourceLangEl.value,
      targetLang: targetLangEl.value,
    }),
    apiSettingsStorage.setValue({
      provider: providerEl.value,
      apiUrl: apiUrlEl.value.trim(),
      apiKey: apiKeyEl.value.trim(),
      model: modelEl.value.trim(),
    }),
  ]);

  statusEl.textContent = '配置已保存！';
  setTimeout(() => {
    statusEl.textContent = '';
  }, 1500);
});

hoverTranslateEnabledEl.addEventListener('change', toggleHoverShortcutField);
providerEl.addEventListener('change', toggleLlmFields);

loadSettings();