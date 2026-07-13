import _RemarkEmoji from 'remark-emoji'
import _Highlight from '/home/przemek/PCODE-pl/zadania-alokai/nuxt3-magento-sdk-storefront/node_modules/@nuxtjs/mdc/dist/runtime/highlighter/rehype-nuxt.js'

export const remarkPlugins = {
  'remark-emoji': { instance: _RemarkEmoji },
}

export const rehypePlugins = {
  'highlight': { instance: _Highlight, options: {} },
}

export const highlight = {"theme":"one-dark-pro"}