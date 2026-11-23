import { apiSettingsStorage, uiSettingsStorage } from '../utils/setting';

interface TranslateRequest {
  type: 'TRANSLATE',
  text: string,
}

interface TranslateResponse {
  success: boolean,
  translatedText?: string,
  error?: string
}

export default defineBackground(() => {
  console.log("服务已经启动");

  browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    const req = message as TranslateRequest;
    if (req.type == 'TRANSLATE') {
      translateText(req.text)
        .then(res => sendResponse({ success: true, translatedText: res }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    }
  })
})

async function translateText(text: string): Promise<string> {
  // 读取全局配置
  const appsettings = await apiSettingsStorage.getValue();
  const uiSettings = await uiSettingsStorage.getValue();

  // 调用 OpenAI 兼容的大模型 API
  if (appsettings.provider === 'llm') {
    if (!appsettings.apiUrl || !appsettings.model) {
      throw new Error('请先在插件设置中填写完整的 API 地址和模型名');
    }

    const response = await fetch(appsettings.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(appsettings.apiKey ? { Authorization: `Bearer ${appsettings.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: appsettings.model,
        messages: [
          {
            role: 'system',
            content: `你是一个专业翻译助手。请将用户输入的内容准确翻译为 ${uiSettings.targetLang}，只输出译文，不要任何解释。`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败 (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '未获取到译文';
  }

  // 默认的 MyMemory 免费接口
  const langpair = `${uiSettings.sourceLang}|${uiSettings.targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP 请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.responseData?.translatedText || '未获取到译文';

}