import LabIntakeIndex, {
    type LabIntakePageProps,
} from '@/pages/laboratories/intake/index';
import {
    create as productCreate,
    destroy as productDestroy,
    edit as productEdit,
    index as productIndex,
} from '@/routes/products';
import { store as productSubcategoryStore } from '@/routes/products/subcategories';

export default function ProductsIndex(props: LabIntakePageProps) {
    return (
        <LabIntakeIndex
            {...props}
            title="Products"
            description="Manage pharmacy products, categories, subcategories, and inventory."
            itemLabel="product"
            padded={false}
            showSkuInsteadOfCategory
            sortableSubcategory
            routeBuilder={(teamSlug, suffix = '') => {
                if (suffix === '/create') {
                    return productCreate.url(teamSlug);
                }

                const itemMatch = suffix.match(/^\/(\d+)(?:\/edit)?$/);
                if (itemMatch) {
                    const itemId = Number(itemMatch[1]);

                    return suffix.endsWith('/edit')
                        ? productEdit.url([teamSlug, itemId])
                        : productDestroy.url([teamSlug, itemId]);
                }

                return productIndex.url(teamSlug);
            }}
            subcategoryStoreUrl={(teamSlug) =>
                productSubcategoryStore.url(teamSlug)
            }
        />
    );
}
