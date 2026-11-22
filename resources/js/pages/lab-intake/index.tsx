import LabIntakeIndex, {
    type LabIntakePageProps,
} from '@/pages/laboratories/intake/index';
import {
    create as labIntakeCreate,
    destroy as labIntakeDestroy,
    edit as labIntakeEdit,
    index as labIntakeIndex,
} from '@/routes/lab-intake';

export default function LabIntakeIndexPage(props: LabIntakePageProps) {
    return (
        <LabIntakeIndex
            {...props}
            title="Lab intake"
            description="Manage laboratory catalog tests, parameters, and inventory links."
            itemLabel="catalog item"
            routeBuilder={(teamSlug, suffix = '') => {
                if (suffix === '/create') {
                    return labIntakeCreate.url(teamSlug);
                }

                const itemMatch = suffix.match(/^\/(\d+)(?:\/edit)?$/);
                if (itemMatch) {
                    const itemId = Number(itemMatch[1]);

                    return suffix.endsWith('/edit')
                        ? labIntakeEdit.url([teamSlug, itemId])
                        : labIntakeDestroy.url([teamSlug, itemId]);
                }

                return labIntakeIndex.url(teamSlug);
            }}
            showSkuInsteadOfCategory
            hideParameters
        />
    );
}
