import LabIntakeEdit from '@/pages/laboratories/intake/edit';
import type { LabIntakeListItem } from '@/types';

export default function PriceListsEdit({
    item,
    formOptions,
}: {
    item: LabIntakeListItem | null;
    formOptions: {
        categories: { id: number; name: string }[];
        subcategories: { id: number; name: string; categoryId: number }[];
        parentTests: { id: number; name: string }[];
        drugForms: { id: number; name: string }[];
        resultTypes: { value: string; label: string }[];
    };
}) {
    return (
        <LabIntakeEdit
            item={item}
            formOptions={formOptions}
            isPriceList={true}
        />
    );
}
