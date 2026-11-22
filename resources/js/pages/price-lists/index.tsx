import LabIntakeIndex, {
    type LabIntakePageProps,
} from '@/pages/laboratories/intake/index';
import {
    create as priceListCreate,
    destroy as priceListDestroy,
    edit as priceListEdit,
    index as priceListIndex,
} from '@/routes/price-lists';

export default function PriceListsIndex(props: LabIntakePageProps) {
    return (
        <LabIntakeIndex
            {...props}
            title="Price lists"
            description="Manage categories, billable services, products, clinical parameters, and stock links."
            itemLabel="price list item"
            padded={false}
            routeBuilder={(teamSlug, suffix = '') => {
                if (suffix === '/create') {
                    return priceListCreate.url(teamSlug);
                }

                const itemMatch = suffix.match(/^\/(\d+)(?:\/edit)?$/);
                if (itemMatch) {
                    const itemId = Number(itemMatch[1]);

                    return suffix.endsWith('/edit')
                        ? priceListEdit.url([teamSlug, itemId])
                        : priceListDestroy.url([teamSlug, itemId]);
                }

                return priceListIndex.url(teamSlug);
            }}
        />
    );
}
