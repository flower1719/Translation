# 翻译助手 (My Translator)

一款基于 [WXT](https://wxt.dev/) + TypeScript 开发的轻量级浏览器翻译扩展，支持免费翻译接口与自定义 OpenAI 兼容大模型 API。

## ✨ 功能特性

- **划词即译**：在任意网页选中文本（≤ 500 字）即可在光标旁弹出气泡，实时显示翻译结果。

## 🛠️ 技术栈

- [WXT](https://wxt.dev/)（浏览器扩展开发框架）
- TypeScript
- Vite

## 📁 项目结构

```text
├── entrypoints/
│   ├── background.ts      # 后台脚本：处理翻译请求（MyMemory / LLM API）
│   ├── content.ts         # 内容脚本：监听划词事件并渲染毛玻璃翻译气泡
│   └── popup/             # 扩展弹窗：设置界面与配置保存逻辑
├── utils/
│   └── setting.ts         # 存储定义：UI 配置与 API 配置分离存储
└── wxt.config.ts          # WXT 与 Manifest 配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
# Chrome（默认）
npm run dev

# Firefox
npm run dev:firefox
```

### 3. 打包构建

```bash
# 构建产物（输出到 .output/ 目录）
npm run build

# 打包为 zip 压缩包
npm run zip
```

### 4. 在浏览器中手动加载

1. 运行 `npm run build` 生成构建产物。
2. 打开 Chrome 扩展管理页面 `chrome://extensions/`。
3. 开启右上角的 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择项目中的 `.output/chrome-mv3` 目录即可。

## 📖 使用说明

1. 点击浏览器工具栏中的 **翻译助手** 图标打开设置面板。
2. 勾选 **开启翻译**，选择源语言、目标语言和翻译引擎。
3. 若选择 **大模型 API**，请填写对应的 API 地址、API Key 和模型名称，然后点击 **保存配置**。
4. 在任意网页中用鼠标划选文字即可查看翻译结果，点击气泡外部区域可关闭气泡。

## 📄 License

MIT
