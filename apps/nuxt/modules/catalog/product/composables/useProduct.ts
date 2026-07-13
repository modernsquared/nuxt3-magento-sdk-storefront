import {sdk} from "~/sdk.config";
import {SortEnum} from "@vue-storefront/magento-types";
import {customProductQuery} from '~/modules/catalog/product/customQueries/customProductQuery';

export default function () {
    const search = async (term: string) => {
        const products = useState('products')
        const {data, pending, refresh} = await useAsyncData('productSearch', async () => {
            return await sdk.magento.products({
                pageSize: 8,
                currentPage: 1,
                search: term,
                sort: {
                    price: SortEnum.Asc
                }
            })
        })

        products.value = data.value?.data.products?.items

        return {
            data: data.value?.data.products?.items,
            pending,
            refresh
        }
    }

    const getProduct = async (sku: string) => {
        const {data, pending, refresh} = await useAsyncData(`product-${sku}`, async () => await sdk.magento.products({
            filter: {
                sku: {
                    eq: sku
                }
            },

        }, {customQuery: customProductQuery}))

        return {
            data: data?.value?.data?.products?.items?.[0],
            pending,
            refresh
        }
    }

    const getProductDetails = async (sku: string) => {
        const productDetails = useState('productDetails')
        const {data, pending, refresh} = await useAsyncData(`productDetails-${sku}`, async () => {
            return await sdk.magento.productDetails({
                filter: {
                    sku: {
                        eq: sku
                    }
                },
            })
        })

        productDetails.value = data.value?.data?.products?.items?.[0]

        return {
            data: data.value?.data?.products?.items?.[0],
            pending,
            refresh
        }
    }

    return {
        search,
        getProduct,
        getProductDetails
    }
}
