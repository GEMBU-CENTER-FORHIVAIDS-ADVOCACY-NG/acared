/**
 * Body part fields used in structured examination notes.
 */
export const EXAMINATION_FIELDS = [
    'Hair',
    'Ear',
    'Eye',
    'Nose',
    'Mouth',
    'Neck',
    'Breast',
    'Abdomen',
    'Leg',
] as const;

/**
 * Type for structured examination notes data (body part -> value).
 */
export type ExaminationNotesData = Record<string, string>;

/**
 * Extract the examination notes data object from a `notes` field that may be
 * a plain string, a JSON string, an array of builder blocks, or a plain object.
 */
export function parseExaminationNotes(
    notes: string | Record<string, unknown>[] | Record<string, unknown> | null | undefined,
): ExaminationNotesData {
    if (typeof notes === 'string') {
        // Try to parse as JSON
        try {
            const parsed = JSON.parse(notes);
            return extractExaminationData(parsed);
        } catch {
            // Plain string notes — return as a single "Notes" field
            return { Notes: notes.trim() };
        }
    }

    if (Array.isArray(notes)) {
        return extractExaminationDataFromBlocks(notes);
    }

    if (typeof notes === 'object' && notes !== null) {
        return extractExaminationData(notes);
    }

    return {};
}

/**
 * Extract examination data from a parsed JSON object.
 * Handles nested structures like { data: { Hair: ... } } or direct { Hair: ... }.
 */
function extractExaminationData(obj: unknown): ExaminationNotesData {
    if (typeof obj !== 'object' || obj === null) {
        return {};
    }

    const record = obj as Record<string, unknown>;

    // Check for nested data key (from Filament Builder blocks)
    if (record.data && typeof record.data === 'object' && record.data !== null) {
        return filterExaminationFields(record.data as Record<string, unknown>);
    }

    // Check for first block with data (array format)
    if (Array.isArray(record)) {
        return extractExaminationDataFromBlocks(record);
    }

    // Direct field mapping
    return filterExaminationFields(record);
}

/**
 * Extract examination data from an array of builder blocks.
 */
function extractExaminationDataFromBlocks(
    blocks: Record<string, unknown>[],
): ExaminationNotesData {
    for (const block of blocks) {
        if (typeof block === 'object' && block !== null) {
            const b = block as Record<string, unknown>;
            if (b.data && typeof b.data === 'object' && b.data !== null) {
                const result = filterExaminationFields(b.data as Record<string, unknown>);
                if (Object.keys(result).length > 0) {
                    return result;
                }
            }
        }
    }
    return {};
}

/**
 * Filter an object to only include known examination fields or any non-empty field.
 */
function filterExaminationFields(
    data: Record<string, unknown>,
): ExaminationNotesData {
    const result: ExaminationNotesData = {};

    // First, add known examination fields
    for (const field of EXAMINATION_FIELDS) {
        const value = data[field];
        if (value !== undefined && value !== null) {
            result[field] = String(value);
        }
    }

    // Then, add any other non-empty fields (for backward compatibility)
    for (const [key, value] of Object.entries(data)) {
        if (!(key in result) && value !== null && value !== undefined && String(value).trim() !== '') {
            result[key] = String(value);
        }
    }

    return result;
}

/**
 * Convert structured examination notes to a plain text string for display.
 */
export function examinationNotesToString(
    notes: string | Record<string, unknown>[] | Record<string, unknown> | null | undefined,
): string {
    const data = parseExaminationNotes(notes);
    const entries = Object.entries(data);

    if (entries.length === 0) {
        return '';
    }

    // If it's a single "Notes" key (plain string notes), return it directly
    if (entries.length === 1 && entries[0][0] === 'Notes') {
        return entries[0][1];
    }

    // Format as structured list
    return entries
        .map(([key, value]) => {
            const val = value || 'Not recorded';
            return `${key}: ${val}`;
        })
        .join('\n');
}

/**
 * Extract a plain text string from a `notes` field that may be a string,
 * an array of editor blocks, or null/undefined.
 */
export function notesToString(
    notes: string | Record<string, unknown>[] | null | undefined,
): string {
    if (typeof notes === 'string') {
        return notes;
    }

    if (Array.isArray(notes)) {
        return notes
            .map((block) =>
                typeof block === 'object' && block !== null
                    ? Object.values(block)
                        .filter((v) => typeof v === 'string')
                        .join(' ')
                    : String(block),
            )
            .filter(Boolean)
            .join(' ');
    }

    return '';
}
