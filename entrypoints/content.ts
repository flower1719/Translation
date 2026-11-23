import { uiSettingsStorage } from '../utils/setting';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let tooltip: HTMLDivElement | null = null;
    let isEnabled = true;
    let mouseDownPos = { x: 0, y: 0 };
    let closedOnMouseDown = false;

    //初始化读取开关状态
    uiSettingsStorage.getValue().then((settings) => {
      isEnabled = settings.enabled;
    });

    //监听全局配置变化
    uiSettingsStorage.watch((newSettings) => {
      isEnabled = newSettings.enabled;
      if (!isEnabled) {
        hideTooltip();
      }
    });

    function showTooltip(x: number, y: number, content: string) {
      if (!tooltip) {
        tooltip = document.createElement('div');
        Object.assign(tooltip.style, {
          position: 'fixed',
          zIndex: '2147483647',
          maxWidth: '320px',
          padding: '10px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(14px) saturate(180%)',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1.5',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.55)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.14), 0 1px 3px rgba(0, 0, 0, 0.08)',
          textShadow: '0 1px 0 rgba(255, 255, 255, 0.4)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          wordBreak: 'break-word',
        });
        tooltip.style.setProperty('-webkit-backdrop-filter', 'blur(14px) saturate(180%)');
        document.body.appendChild(tooltip);

      }

      const left = Math.min(x + 10, window.innerWidth - 340);
      const top = Math.min(y + 12, window.innerHeight - 100);

      tooltip.style.left = `${Math.max(10, left)}px`;
      tooltip.style.top = `${Math.max(10, top)}px`;
      tooltip.textContent = content;
      tooltip.style.display = 'block';
    }

    function hideTooltip() {
      if (tooltip) {
        tooltip.style.display = 'none';
      }
    }

    document.addEventListener('mouseup', async (event) => {
      if (!isEnabled) return;
      if (tooltip && tooltip.contains(event.target as Node)) {
        return;
      }

      const isClick = Math.abs(event.clientX - mouseDownPos.x) < 3 && Math.abs(event.clientY - mouseDownPos.y) < 3;
      if (closedOnMouseDown && isClick) {
        closedOnMouseDown = false;
        return;
      }
      closedOnMouseDown = false;

      const selectedText = window.getSelection()?.toString().trim();
      if (!selectedText) {
        hideTooltip();
        return;
      }

      if (selectedText.length > 500) {
        showTooltip(event.clientX, event.clientY, '选中文本过长，请分段划词（≤500字）');
        return;
      }

      showTooltip(event.clientX, event.clientY, '翻译中...');

      try {
        const response = await browser.runtime.sendMessage({
          type: 'TRANSLATE',
          text: selectedText,
        });

        if (response?.success) {
          showTooltip(event.clientX, event.clientY, response.translatedText);
        } else {
          showTooltip(event.clientX, event.clientY, `翻译失败：${response?.error ?? '未知错误'}`);
        }
      } catch (err) {
        showTooltip(event.clientX, event.clientY, `通信出错：${String(err)}`);
      }
    });

    document.addEventListener('mousedown', (event) => {
      closedOnMouseDown = false;
      mouseDownPos = { x: event.clientX, y: event.clientY };
      if (tooltip && !tooltip.contains(event.target as Node)) {
        hideTooltip();
        closedOnMouseDown = true;
      }
    });
  },
});