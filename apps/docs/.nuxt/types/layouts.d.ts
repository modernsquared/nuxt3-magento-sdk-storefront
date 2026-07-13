import type { ComputedRef, MaybeRef } from 'vue'

type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
  : {}

declare module 'nuxt/app' {
  interface NuxtLayouts {
    default: ComponentProps<typeof import("/home/przemek/PCODE-pl/zadania-alokai/nuxt3-magento-sdk-storefront/node_modules/sf-docs-base/layouts/default.vue").default>,
    fullscreen: ComponentProps<typeof import("/home/przemek/PCODE-pl/zadania-alokai/nuxt3-magento-sdk-storefront/node_modules/sf-docs-base/layouts/fullscreen.vue").default>,
}
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}