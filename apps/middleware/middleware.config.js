import {config} from "dotenv";
import consola from "consola";

config();

const originalFetch = globalThis.fetch;

const cookieNames = {
    currencyCookieName: 'vsf-currency',
    countryCookieName: 'vsf-country',
    localeCookieName: 'vsf-locale',
    cartCookieName: 'vsf-cart',
    customerCookieName: 'vsf-customer',
    storeCookieName: 'vsf-store',
    messageCookieName: 'vsf-message',
    xdebugSessionCookieName: process.env.VSF_XDEBUG_SESSION_COOKIE_NAME || 'XDEBUG_SESSION'
};

const isXdebugSessionForwardingEnabled = process.env.VSF_FORWARD_XDEBUG_SESSION === 'true';

const getCookie = (cookieHeader, cookieName) => cookieHeader
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`));

const xdebugSessionExtension = {
    name: 'xdebugSessionExtension',
    hooks: (req) => ({
        beforeCreate: ({ configuration }) => {
            if (!isXdebugSessionForwardingEnabled) {
                return configuration;
            }

            const xdebugSessionCookie = getCookie(
                req.headers.cookie,
                configuration.cookies.xdebugSessionCookieName
            );

            if (!xdebugSessionCookie) {
                return configuration;
            }

            const fetch = configuration.customApolloHttpLinkOptions?.fetch || originalFetch;

            return {
                ...configuration,
                customApolloHttpLinkOptions: {
                    ...configuration.customApolloHttpLinkOptions,
                    fetch: (url, options) => {
                        const headers = new Headers(options?.headers);
                        headers.set('cookie', xdebugSessionCookie);

                        return fetch(url, {
                            ...options,
                            headers,
                        });
                    },
                },
            };
        },
    }),
};

export const integrations = {
    magento: {
        location: '@vue-storefront/magento-api/server',
        extensions: (extensions) => [...extensions, xdebugSessionExtension],
        customQueries: {
            'category-search-custom-query': ({ variables, metadata }) => ({
               variables,
               query: `
                 query categorySearch($filters: CategoryFilterInput) {
                   categoryList(filters: $filters) {
                     ${metadata.fields}
                   }
                 }
               `
            }),
            'products-custom-query': ({ variables, metadata }) => ({
                   variables,
                   query: `
                     query productsList(
                       $search: String = "",
                       $filter: ProductAttributeFilterInput,
                       $pageSize: Int = 10,
                       $currentPage: Int = 1,
                       $sort: ProductAttributeSortInput
                     ) {
                       products(search: $search, filter: $filter, sort: $sort, pageSize: $pageSize, currentPage: $currentPage) {
                         ${metadata.fields}
                       }
                     }
                   `
                }),    
          },
        configuration: {
            api: process.env.VSF_MAGENTO_GRAPHQL_URL,
            cookies: {
                ...cookieNames,
            },
            cookiesDefaultOpts: {
                httpOnly: process.env.VSF_COOKIE_HTTP_ONLY || false,
                secure: process.env.VSF_COOKIE_SECURE || false,
                sameSite: process.env.VSF_COOKIE_SAME_SITE || 'lax',
                path: process.env.VSF_COOKIE_PATH || '/',
            },
            defaultStore: 'default',
            customApolloHttpLinkOptions: {
                useGETForQueries: false,
                fetch: (url, options) => {
                    if (process.env.VSF_DEBUG_GRAPHQL === 'true') {
                        try {
                            const u = typeof url === 'string' ? url : url.toString();
                            const parsed = new URL(u, 'http://localhost');
                            const queryParam = parsed.searchParams.get('query');
                            if (queryParam) {
                                consola.info('[GraphQL query] ' + decodeURIComponent(queryParam).replace(/\n\s*/g, ' '));
                            } else if (options?.body) {
                                const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
                                if (body?.query) {
                                    consola.info('[GraphQL query] ' + body.query.replace(/\n\s*/g, ' '));
                                }
                            }
                        } catch (_) {}
                    }
                    return originalFetch(url, options);
                },
            },
            magentoBaseUrl: process.env.VSF_MAGENTO_BASE_URL,
            magentoApiEndpoint: process.env.VSF_MAGENTO_GRAPHQL_URL,
            imageProvider: process.env.NUXT_IMAGE_PROVIDER,
            recaptcha: {
                isEnabled: process.env.VSF_RECAPTCHA_ENABLED === 'true',
                sitekey: process.env.VSF_RECAPTCHA_SITE_KEY,
                secretkey: process.env.VSF_RECAPTCHA_SECRET_KEY,
                version: process.env.VSF_RECAPTCHA_VERSION,
                score: process.env.VSF_RECAPTCHA_MIN_SCORE,
            },
            customer: {
                customer_create_account_confirm: true,
            },
        }
    }
};
