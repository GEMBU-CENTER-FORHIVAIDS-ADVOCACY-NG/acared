import LabIntakeIndex, {
    type LabIntakePageProps,
} from '@/pages/laboratories/intake/index';
import { index } from '@/routes/products';
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
            routeBuilder={(teamSlug, suffix = '') =>
                `${index.url(teamSlug)}${suffix}`
            }
            subcategoryStoreUrl={(teamSlug) => productSubcategoryStore.url(teamSlug)}
        />
    );
}
