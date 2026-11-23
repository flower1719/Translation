import {
  DEFAULT_UISETTINGS,
  matchesShortcut,
  type UiSetting,
  uiSettingsStorage,
} from '../utils/setting';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let tooltip: HTMLDivElement | null = null;
    let uiSettings: UiSetting = { ...DEFAULT_UISETTINGS };
    let mouseDownPos = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };
    let closedOnMouseDown = false;

    // 初始化读取 UI 配置
    uiSettingsStorage.getValue().then((settings) => {
      uiSettings = { ...DEFAULT_UISETTINGS, ...settings };
    });

    // 监听全局配置变化
    uiSettingsStorage.watch((newSettings) => {
      uiSettings = { ...DEFAULT_UISETTINGS, ...newSettings };
      if (!uiSettings.enabled) {
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

    async function translateAndShow(text: string, x: number, y: number) {
      if (!text) return;

      const maxLen = uiSettings.maxTranslateLength;
      if (text.length > maxLen) {
        showTooltip(x, y, `选中文本过长，请分段翻译（≤${maxLen}字）`);
        return;
      }

      showTooltip(x, y, '翻译中...');

      try {
        const response = await browser.runtime.sendMessage({
          type: 'TRANSLATE',
          text,
        });

        if (response?.success) {
          showTooltip(x, y, response.translatedText);
        } else {
          showTooltip(x, y, `翻译失败：${response?.error ?? '未知错误'}`);
        }
      } catch (err) {
        showTooltip(x, y, `通信出错：${String(err)}`);
      }
    }

    function extractTextAtPoint(x: number, y: number): string {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!el || (tooltip && tooltip.contains(el))) return '';

      const innerText = el.innerText?.trim();
      if (innerText && innerText.length <= uiSettings.maxTranslateLength) {
        return innerText;
      }

      const range = document.caretRangeFromPoint?.(x, y);
      const nodeText = range?.startContainer?.textContent?.trim();
      if (nodeText) {
        return nodeText;
      }

      if (innerText) {
        return innerText;
      }

      return (
        el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        el.getAttribute('placeholder') ||
        el.getAttribute('alt') ||
        ''
      ).trim();
    }

    function isEditableTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      );
    }

    document.addEventListener('mousemove', (event) => {
      lastMousePos = { x: event.clientX, y: event.clientY };
    });

    document.addEventListener('mouseup', async (event) => {
      if (!uiSettings.enabled) return;
      if (tooltip && tooltip.contains(event.target as Node)) {
        return;
      }

      const isClick =
        Math.abs(event.clientX - mouseDownPos.x) < 3 &&
        Math.abs(event.clientY - mouseDownPos.y) < 3;
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

      await translateAndShow(selectedText, event.clientX, event.clientY);
    });

    document.addEventListener('keydown', (event) => {
      if (!uiSettings.enabled || !uiSettings.hoverTranslateEnabled) return;
      if (isEditableTarget(event.target) || isEditableTarget(document.activeElement)) {
        return;
      }
      if (!matchesShortcut(event, uiSettings.hoverShortcut)) return;

      const text = extractTextAtPoint(lastMousePos.x, lastMousePos.y);
      if (!text) return;

      event.preventDefault();
      translateAndShow(text, lastMousePos.x, lastMousePos.y);
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