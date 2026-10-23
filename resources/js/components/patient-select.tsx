import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';

export type PatientOption = {
    id: string;
    name: string;
};

type PatientSelectProps = {
    id: string;
    label: string;
    value: string;
    options: PatientOption[];
    onChange: (value: string) => void;
    onSearch: (term: string) => Promise<unknown> | void;
    disabled?: boolean;
    placeholder?: string;
};

/**
 * Patient picker backed by a server side search.
 *
 * The roster can hold tens of thousands of patients, so only a bounded list
 * is sent to the browser and the parent refreshes it as the user searches.
 */
export default function PatientSelect({
    id,
    label,
    value,
    options,
    onChange,
    onSearch,
    disabled = false,
    placeholder = 'Select patient',
}: PatientSelectProps) {
    const [term, setTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const searchRef = useRef(onSearch);
    const mountedRef = useRef(false);

    useEffect(() => {
        searchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;

            return;
        }

        setSearching(true);

        const timer = window.setTimeout(async () => {
            try {
                await searchRef.current(term);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => window.clearTimeout(timer);
    }, [term]);

    return (
        <div className="space-y-2">
            <Label htmlFor={`${id}-search`}>{label}</Label>
            <Input
                id={`${id}-search`}
                value={term}
                placeholder="Search by name or hospital number"
                disabled={disabled}
                onChange={(event) => setTerm(event.target.value)}
            />
            <SelectNative
                id={id}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </SelectNative>
            {searching ? (
                <p className="text-xs text-muted-foreground">
                    Searching patients…
                </p>
            ) : null}
        </div>
    );
}
