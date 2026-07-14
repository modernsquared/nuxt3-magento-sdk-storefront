// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    forwardXdebugSession: process.env.VSF_FORWARD_XDEBUG_SESSION === 'true',
    xdebugSessionCookieName: process.env.VSF_XDEBUG_SESSION_COOKIE_NAME || 'XDEBUG_SESSION',
    public: {
      demoContent: process.env.VSF_DEMO_CONTENT,
      pageBuilder: process.env.VSF_PAGE_BUILDER_MODULE,
      imageProvider: process.env.NUXT_IMAGE_PROVIDER,
      magentoBaseUrl: process.env.MAGENTO_BASE_URL,
    }
  }
})
