import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({

    manifest: {
        name: "翻译助手",
        description: "一个翻译扩展",
        permissions: ["storage"],
        host_permissions: ['https://*/*', 'http://*/*'],
    }
});
