import LabIntakeIndex, {
    type LabIntakePageProps,
} from '@/pages/laboratories/intake/index';
import { index } from '@/routes/lab-intake';

export default function LabIntakeIndexPage(props: LabIntakePageProps) {
    return (
        <LabIntakeIndex
            {...props}
            title="Lab intake"
            description="Manage laboratory catalog tests, parameters, and inventory links."
            itemLabel="catalog item"
            routeBuilder={(teamSlug, suffix = '') =>
                `${index.url(teamSlug)}${suffix}`
            }
            showSkuInsteadOfCategory
        />
    );
}
