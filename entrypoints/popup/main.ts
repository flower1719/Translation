import { apiSettingsStorage, uiSettingsStorage } from '../../utils/setting';

const enabledEl = document.getElementById('enabled') as HTMLInputElement;
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

// 打开弹窗
async function loadSettings() {
  const uisettings = await uiSettingsStorage.getValue();
  const appsettings = await apiSettingsStorage.getValue();
  enabledEl.checked = uisettings.enabled;
  sourceLangEl.value = uisettings.sourceLang;
  targetLangEl.value = uisettings.targetLang;
  providerEl.value = appsettings.provider;
  apiUrlEl.value = appsettings.apiUrl;
  apiKeyEl.value = appsettings.apiKey;
  modelEl.value = appsettings.model;
  toggleLlmFields();
}

// 点击保存
saveBtn.addEventListener('click', async () => {
  await uiSettingsStorage.setValue({
    enabled: enabledEl.checked,
    sourceLang: sourceLangEl.value,
    targetLang: targetLangEl.value,
  });

  await apiSettingsStorage.setValue({
    provider: providerEl.value,
    apiUrl: apiUrlEl.value.trim(),
    apiKey: apiKeyEl.value.trim(),
    model: modelEl.value.trim(),
  });

  statusEl.textContent = '配置已保存！';
  setTimeout(() => {
    statusEl.textContent = '';
  }, 1500);
});

providerEl.addEventListener('change', toggleLlmFields);

loadSettings();