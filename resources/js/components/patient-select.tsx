import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import type { Team } from '@/types';

export type PatientOption = {
    id: string;
    name: string;
};

type PatientSearchResult = {
    slug: string;
    label: string;
};

type PatientSelectProps = {
    id: string;
    label: string;
    value: string;
    options: PatientOption[];
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    /**
     * URL resolver for the patient search endpoint. Receives the team slug
     * and search query, should return the full search URL.
     */
    searchUrl?: (teamSlug: string, query: string) => string;
};

/**
 * Patient picker backed by server-side search via a JSON endpoint.
 *
 * The roster can hold tens of thousands of patients, so only a bounded list
 * is sent to the browser and the component searches as the user types.
 */
export default function PatientSelect({
    id,
    label,
    value,
    options,
    onChange,
    disabled = false,
    placeholder = 'Select patient',
    searchUrl,
}: PatientSelectProps) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [term, setTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced search for patients using fetch to avoid Inertia JSON response error
    const searchPatients = useCallback((query: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!query.trim() || !searchUrl) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        debounceTimerRef.current = setTimeout(() => {
            const url = searchUrl(teamSlug, query);
            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((results) => {
                    setSearchResults(results);
                    setSearching(false);
                })
                .catch(() => {
                    setSearching(false);
                });
        }, 300);
    }, [teamSlug, searchUrl]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Display results from search when term is active, otherwise fall back to parent-provided options
    const displayOptions = term.trim()
        ? searchResults.map((r) => ({ id: r.slug, name: r.label }))
        : options;

    return (
        <div className="space-y-2">
            <Label htmlFor={`${id}-search`}>{label}</Label>
            <Input
                id={`${id}-search`}
                value={term}
                placeholder="Search by name or hospital number"
                disabled={disabled}
                onChange={(event) => {
                    const val = event.target.value;
                    setTerm(val);
                    searchPatients(val);
                }}
            />
            <SelectNative
                id={id}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">{placeholder}</option>
                {displayOptions.map((option) => (
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
