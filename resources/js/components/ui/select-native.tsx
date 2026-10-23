import { Check, ChevronDown, Search, X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

type ParsedOption = {
    value: string;
    label: string;
    node: React.ReactNode;
    disabled?: boolean;
};

function getNodeText(node: React.ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') {
        return '';
    }
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node).trim();
    }
    if (Array.isArray(node)) {
        return node.map(getNodeText).filter(Boolean).join(' ').trim();
    }
    if (React.isValidElement(node)) {
        const props = node.props as { children?: React.ReactNode };
        if (props && props.children) {
            return getNodeText(props.children);
        }
    }
    return '';
}

function extractOptions(children: React.ReactNode): ParsedOption[] {
    const options: ParsedOption[] = [];

    const traverse = (child: React.ReactNode) => {
        if (!child) {
            return;
        }

        if (Array.isArray(child)) {
            child.forEach(traverse);
            return;
        }

        if (React.isValidElement(child)) {
            if (child.type === 'option') {
                const props = child.props as React.ComponentProps<'option'>;
                const value =
                    props.value !== undefined ? String(props.value) : '';
                const text = getNodeText(props.children);
                options.push({
                    value,
                    label: text || value,
                    node: props.children,
                    disabled: props.disabled,
                });
                return;
            }

            const props = child.props as { children?: React.ReactNode };
            if (props && props.children) {
                traverse(props.children);
            }
        }
    };

    traverse(children);
    return options;
}

export type SelectNativeProps = React.ComponentProps<'select'> & {
    searchable?: boolean;
    'data-test'?: string;
    placeholder?: string;
    [key: `data-${string}`]: unknown;
};

function SelectNative({
    className,
    children,
    searchable = true,
    'data-test': dataTest,
    placeholder,
    ...props
}: SelectNativeProps) {
    const options = React.useMemo(
        () => extractOptions(children),
        [children],
    );

    const isControlled = props.value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(() => {
        if (props.value !== undefined) {
            return String(props.value);
        }
        if (props.defaultValue !== undefined) {
            return String(props.defaultValue);
        }
        return '';
    });

    React.useEffect(() => {
        if (props.value !== undefined) {
            setInternalValue(String(props.value));
        }
    }, [props.value]);

    React.useEffect(() => {
        if (!isControlled && props.defaultValue !== undefined) {
            setInternalValue(String(props.defaultValue));
        }
    }, [props.defaultValue, isControlled]);

    const currentValue = isControlled ? String(props.value) : internalValue;

    // Keep internalValue in sync if options change dynamically and current selection is missing
    React.useEffect(() => {
        if (!isControlled && options.length > 0) {
            const hasMatch = options.some((opt) => opt.value === internalValue);
            if (!hasMatch) {
                const defaultOption =
                    options.find((opt) => opt.value === props.defaultValue) ??
                    options[0];
                if (defaultOption && internalValue !== defaultOption.value) {
                    setInternalValue(defaultOption.value);
                }
            }
        }
    }, [options, isControlled, props.defaultValue, internalValue]);

    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const [openUpward, setOpenUpward] = React.useState(false);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const selectRef = React.useRef<HTMLSelectElement>(null);
    const optionsListRef = React.useRef<HTMLDivElement>(null);

    // Calculate whether dropdown should open upward or downward
    React.useEffect(() => {
        if (!isOpen || !triggerRef.current) {
            return;
        }
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 260;
        setOpenUpward(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
    }, [isOpen]);

    // Handle clicks outside the container
    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            if (containerRef.current?.contains(target)) {
                return;
            }
            setIsOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [isOpen]);

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return options;
        }
        const query = searchQuery.toLowerCase().trim();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(query) ||
                opt.value.toLowerCase().includes(query),
        );
    }, [options, searchQuery]);

    React.useEffect(() => {
        setHighlightedIndex(0);
    }, [filteredOptions]);

    React.useEffect(() => {
        if (!isOpen || !optionsListRef.current) {
            return;
        }
        const activeOption = optionsListRef.current.children[
            highlightedIndex
        ] as HTMLElement | undefined;
        if (activeOption && typeof activeOption.scrollIntoView === 'function') {
            activeOption.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex, isOpen]);

    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 30);
            return () => clearTimeout(timer);
        } else {
            setSearchQuery('');
        }
    }, [isOpen]);

    const selectValue = (val: string) => {
        if (!isControlled) {
            setInternalValue(val);
        }
        setIsOpen(false);
        setSearchQuery('');

        if (selectRef.current) {
            selectRef.current.value = val;
            const nativeEvent = new Event('change', { bubbles: true });
            selectRef.current.dispatchEvent(nativeEvent);
        }

        if (props.onChange) {
            const syntheticEvent = {
                target: {
                    value: val,
                    name: props.name || '',
                    id: props.id || '',
                },
                currentTarget: {
                    value: val,
                    name: props.name || '',
                    id: props.id || '',
                },
                preventDefault: () => {},
                stopPropagation: () => {},
            } as unknown as React.ChangeEvent<HTMLSelectElement>;

            props.onChange(syntheticEvent);
        }
    };

    const selectedOption = options.find((opt) => opt.value === currentValue);
    const displayNode = selectedOption ? (
        selectedOption.node !== undefined && selectedOption.node !== '' ? (
            selectedOption.node
        ) : (
            selectedOption.label
        )
    ) : (
        placeholder || options[0]?.node || 'Select...'
    );

    const isPlaceholder =
        !currentValue || (selectedOption && selectedOption.value === '');

    return (
        <div ref={containerRef} className="relative inline-block w-full">
            {/* Hidden native select for form serialization, accessibility, and tests */}
            <select
                ref={selectRef}
                name={props.name}
                id={props.id}
                value={currentValue}
                required={props.required}
                disabled={props.disabled}
                tabIndex={-1}
                aria-hidden="true"
                data-slot="select-native"
                data-test={dataTest}
                className="sr-only pointer-events-none absolute h-0 w-0 opacity-0"
                onChange={(e) => selectValue(e.target.value)}
            >
                {children}
            </select>

            {/* Custom searchable trigger */}
            <button
                ref={triggerRef}
                type="button"
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={props['aria-label']}
                disabled={props.disabled}
                data-slot="select-native-trigger"
                data-test={dataTest ? `${dataTest}-trigger` : undefined}
                onClick={() => {
                    if (!props.disabled) {
                        setIsOpen((prev) => !prev);
                    }
                }}
                onKeyDown={(e) => {
                    if (props.disabled) {
                        return;
                    }
                    if (
                        e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'Enter' ||
                        e.key === ' '
                    ) {
                        e.preventDefault();
                        setIsOpen(true);
                    }
                }}
                className={cn(
                    'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex min-h-9 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-left',
                    className,
                )}
            >
                <span
                    className={cn(
                        'text-left flex-1 whitespace-normal break-words',
                        isPlaceholder && 'text-muted-foreground',
                    )}
                >
                    {displayNode}
                </span>
                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 opacity-50 transition-transform duration-200 ml-2',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {/* Searchable Dropdown List - rendered directly in component so it stays inside Dialogs/Sheets */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    role="listbox"
                    tabIndex={-1}
                    className={cn(
                        'absolute left-0 right-0 z-[1000] rounded-md border bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[260px]',
                        openUpward ? 'bottom-full mb-1' : 'top-full mt-1',
                    )}
                >
                    {searchable ? (
                        <div
                            className="flex items-center border-b px-2.5 py-1.5 gap-2 bg-muted/20 shrink-0"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Search className="size-3.5 text-muted-foreground shrink-0" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                placeholder="Search options..."
                                className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                                onPointerDown={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === 'Escape' ||
                                        e.key === 'Tab'
                                    ) {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                    } else if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setHighlightedIndex((prev) =>
                                            prev < filteredOptions.length - 1
                                                ? prev + 1
                                                : 0,
                                        );
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setHighlightedIndex((prev) =>
                                            prev > 0
                                                ? prev - 1
                                                : filteredOptions.length - 1,
                                        );
                                    } else if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (
                                            filteredOptions[highlightedIndex] &&
                                            !filteredOptions[highlightedIndex]
                                                .disabled
                                        ) {
                                            selectValue(
                                                filteredOptions[
                                                    highlightedIndex
                                                ].value,
                                            );
                                        }
                                    }
                                }}
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                >
                                    <X className="size-3" />
                                </button>
                            ) : null}
                        </div>
                    ) : null}

                    <div
                        ref={optionsListRef}
                        className="overflow-y-auto p-1 text-sm space-y-0.5"
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="py-4 text-center text-xs text-muted-foreground">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const isSelected =
                                    opt.value === currentValue;
                                const isHighlighted =
                                    idx === highlightedIndex;

                                return (
                                    <div
                                        key={`${opt.value}-${idx}`}
                                        role="option"
                                        aria-selected={isSelected}
                                        data-disabled={
                                            opt.disabled || undefined
                                        }
                                        onPointerDown={(e) => {
                                            if (!opt.disabled) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                selectValue(opt.value);
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (!opt.disabled) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                selectValue(opt.value);
                                            }
                                        }}
                                        onMouseEnter={() =>
                                            setHighlightedIndex(idx)
                                        }
                                        className={cn(
                                            'flex items-center justify-between px-2.5 py-1.5 rounded-sm cursor-pointer text-sm select-none transition-colors',
                                            isHighlighted &&
                                                'bg-accent text-accent-foreground',
                                            isSelected &&
                                                'font-medium text-primary',
                                            opt.disabled &&
                                                'opacity-50 cursor-not-allowed pointer-events-none text-muted-foreground',
                                        )}
                                    >
                                        <span className="truncate">
                                            {opt.node !== undefined &&
                                            opt.node !== ''
                                                ? opt.node
                                                : opt.label}
                                        </span>
                                        {isSelected ? (
                                            <Check className="size-4 shrink-0 text-primary ml-2" />
                                        ) : null}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export { SelectNative };
