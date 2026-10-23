import LabIntakeIndex, {
    type LabIntakePageProps,
} from '@/pages/laboratories/intake/index';
import { index } from '@/routes/price-lists';

export default function PriceListsIndex(props: LabIntakePageProps) {
    return (
        <LabIntakeIndex
            {...props}
            title="Price lists"
            description="Manage categories, billable services, products, clinical parameters, and stock links."
            itemLabel="price list item"
            padded={false}
            routeBuilder={(teamSlug, suffix = '') =>
                `${index.url(teamSlug)}${suffix}`
            }
        />
    );
}
