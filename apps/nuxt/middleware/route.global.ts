import {sdk} from "~/sdk.config"
import type {RoutableInterface} from "@vue-storefront/magento-types";

interface ExtendedRoutableInterface extends RoutableInterface {
    sku: string | undefined;
    uid: string | undefined;
}

const getCookie = (cookieHeader: string | undefined, cookieName: string) =>
    cookieHeader
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${cookieName}=`));

export default defineNuxtRouteMiddleware(async (to, from) => {

    try {
        const config = useRuntimeConfig();
        const xdebugSessionCookie = import.meta.server && config.forwardXdebugSession
            ? getCookie(
                useRequestHeaders(['cookie']).cookie,
                config.xdebugSessionCookieName
            )
            : undefined;
        const mageRoute = await sdk.magento.route(
            {url: to.path},
            xdebugSessionCookie
                ? {
                    clientConfig: {
                        headers: {
                            Cookie: xdebugSessionCookie,
                        },
                    },
                }
                : undefined
        )
        const route = mageRoute?.data?.route as ExtendedRoutableInterface
        const routeData = {
            type: route?.type,
            sku: route?.sku,
            uid: route?.uid,
        }

        if (routeData.type == null) {
            return;
        }

        const routeState = useState('routeData', () => routeData)

        if (to.path !== from.path) {
            routeState.value = routeData
        }
    } catch (e) {
         console.log('route not found', e)
    }

})
