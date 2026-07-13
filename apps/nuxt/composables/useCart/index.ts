import { sdk } from '~/sdk.config';

const CART_COOKIE = 'vsf-cart';

export function useCart() {
    const cartId = useCookie<string | null>(CART_COOKIE, {
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
    });

    const getCartId = async () => {
        if (cartId.value) {
            return cartId.value.replace(/^"|"$/g, '');
        }
        const result = await sdk.magento.createEmptyCart();
        const id = result?.data?.createEmptyCart;
        if (id) {
            cartId.value = id;
        }
        return id;
    };

    const addToCart = async (sku: string, quantity: number) => {
        const id = await getCartId();
        if (!id) return;

        return await sdk.magento.addProductsToCart({
            cartId: id,
            cartItems: [{ sku, quantity }],
        });
    };

    return {
        cartId,
        getCartId,
        addToCart,
    };
}

export default useCart;
