import { Head, router, usePage } from '@inertiajs/react';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import vendorRoutes from '@/routes/vendors';
import type { Team } from '@/types';

type Vendor = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    company: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type VendorForm = Pick<
    Vendor,
    'name' | 'email' | 'phone' | 'mobile' | 'address' | 'company'
>;
const emptyForm: VendorForm = {
    name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    company: '',
};

export default function VendorsIndex({
    vendors,
    filters,
}: {
    vendors: Paginator<Vendor>;
    filters: { q: string; perPage: number };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [query, setQuery] = useState(filters.q);
    const [form, setForm] = useState<VendorForm>(emptyForm);
    const [editing, setEditing] = useState<Vendor | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<Vendor | null>(null);
    const [viewing, setViewing] = useState<Vendor | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [formProcessing, setFormProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formFieldErrors, setFormFieldErrors] = useState<
        Record<string, string>
    >({});
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);
    const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setFormError(null);
        setFormFieldErrors({});
        setFormOpen(true);
    }

    function openEdit(vendor: Vendor) {
        setEditing(vendor);
        setForm({
            name: vendor.name,
            email: vendor.email ?? '',
            phone: vendor.phone ?? '',
            mobile: vendor.mobile ?? '',
            address: vendor.address ?? '',
            company: vendor.company ?? '',
        });
        setFormError(null);
        setFormFieldErrors({});
        setFormOpen(true);
    }

    function submit() {
        setFormProcessing(true);
        setFormError(null);
        setFormFieldErrors({});
        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) => {
                setFormFieldErrors(errors);
                setFormError(
                    Object.values(errors)[0] ?? 'Unable to save vendor.',
                );
            },
            onFinish: () => setFormProcessing(false),
        };

        if (editing) {
            router.patch(
                vendorRoutes.update.url({
                    current_team: teamSlug,
                    vendor: editing.id,
                }),
                form,
                options,
            );
        } else {
            router.post(vendorRoutes.store.url(teamSlug), form, options);
        }
    }

    function destroy() {
        if (!deleting || deleteProcessing) return;
        setDeleteProcessing(true);
        setDeleteError(null);
        router.delete(
            vendorRoutes.destroy.url({
                current_team: teamSlug,
                vendor: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (errors: Record<string, string>) =>
                    setDeleteError(
                        Object.values(errors)[0] ?? 'Unable to delete vendor.',
                    ),
                onFinish: () => setDeleteProcessing(false),
            },
        );
    }

    function destroySelected() {
        if (selectedIds.length === 0 || bulkDeleteProcessing) return;
        setBulkDeleteProcessing(true);
        setBulkDeleteError(null);
        router.delete(vendorRoutes.bulk.destroy.url(teamSlug), {
            data: { ids: selectedIds },
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setBulkDeleteOpen(false);
            },
            onError: (errors: Record<string, string>) =>
                setBulkDeleteError(
                    Object.values(errors)[0] ?? 'Unable to delete vendors.',
                ),
            onFinish: () => setBulkDeleteProcessing(false),
        });
    }

    function applySearch() {
        router.get(
            vendorRoutes.index.url(teamSlug, {
                query: {
                    q: query || undefined,
                    perPage: filters.perPage,
                    page: 1,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function changePage(page: number) {
        router.get(
            vendorRoutes.index.url(teamSlug, {
                query: {
                    q: filters.q || undefined,
                    perPage: filters.perPage,
                    page,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function changePerPage(perPage: number) {
        router.get(
            vendorRoutes.index.url(teamSlug, {
                query: { q: filters.q || undefined, perPage, page: 1 },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Vendors" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Vendors"
                        description="Manage suppliers used for inventory purchases."
                    />
                    <Button onClick={openCreate}>Create vendor</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex flex-1 flex-wrap items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applySearch();
                        }}
                    >
                        <Label htmlFor="vendor-search" className="sr-only">
                            Search vendors
                        </Label>
                        <Input
                            id="vendor-search"
                            className="max-w-sm"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search vendors..."
                        />
                        <Button type="submit">Search</Button>
                    </form>
                    {selectedIds.length > 0 ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setBulkDeleteError(null);
                                    setBulkDeleteOpen(true);
                                }}
                            >
                                Delete selected
                            </Button>
                        </>
                    ) : null}
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <input
                                            type="checkbox"
                                            aria-label="Select all vendors on this page"
                                            checked={
                                                vendors.data.length > 0 &&
                                                vendors.data.every((vendor) =>
                                                    selectedIds.includes(
                                                        vendor.id,
                                                    ),
                                                )
                                            }
                                            onChange={(event) =>
                                                setSelectedIds(
                                                    event.target.checked
                                                        ? [
                                                              ...new Set([
                                                                  ...selectedIds,
                                                                  ...vendors.data.map(
                                                                      (
                                                                          vendor,
                                                                      ) =>
                                                                          vendor.id,
                                                                  ),
                                                              ]),
                                                          ]
                                                        : selectedIds.filter(
                                                              (id) =>
                                                                  !vendors.data.some(
                                                                      (
                                                                          vendor,
                                                                      ) =>
                                                                          vendor.id ===
                                                                          id,
                                                                  ),
                                                          ),
                                                )
                                            }
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email address</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendors.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No vendors found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vendors.data.map((vendor) => (
                                        <TableRow key={vendor.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Select ${vendor.name}`}
                                                    checked={selectedIds.includes(
                                                        vendor.id,
                                                    )}
                                                    onChange={(event) =>
                                                        setSelectedIds(
                                                            event.target.checked
                                                                ? [
                                                                      ...selectedIds,
                                                                      vendor.id,
                                                                  ]
                                                                : selectedIds.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          vendor.id,
                                                                  ),
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {vendor.name}
                                            </TableCell>
                                            <TableCell>
                                                {vendor.email ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {vendor.phone ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {vendor.mobile ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {vendor.company ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            aria-label={`Actions for vendor ${vendor.id}`}
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setViewing(
                                                                    vendor,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEdit(vendor)
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setDeleting(
                                                                    vendor,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Pagination
                    meta={{
                        currentPage: vendors.current_page,
                        lastPage: vendors.last_page,
                        perPage: vendors.per_page,
                        total: vendors.total,
                    }}
                    onPageChange={changePage}
                    onPerPageChange={changePerPage}
                />
            </div>
            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Edit vendor' : 'Create vendor'}
                        </SheetTitle>
                        <SheetDescription>
                            Vendor contact details and information.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 px-4 py-5 sm:grid-cols-2">
                        {(
                            [
                                'name',
                                'email',
                                'phone',
                                'mobile',
                                'company',
                            ] as const
                        ).map((field) => (
                            <div key={field} className="space-y-2">
                                <Label htmlFor={field}>
                                    {field === 'email'
                                        ? 'Email address'
                                        : field[0].toUpperCase() +
                                          field.slice(1)}
                                </Label>
                                <Input
                                    id={field}
                                    type={field === 'email' ? 'email' : 'text'}
                                    aria-invalid={!!formFieldErrors[field]}
                                    value={form[field] ?? ''}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            [field]: event.target.value,
                                        })
                                    }
                                    required={field === 'name'}
                                />
                                <InputError message={formFieldErrors[field]} />
                            </div>
                        ))}
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                aria-invalid={!!formFieldErrors.address}
                                value={form.address ?? ''}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        address: event.target.value,
                                    })
                                }
                            />
                            <InputError message={formFieldErrors.address} />
                        </div>
                        {formError ? (
                            <div className="sm:col-span-2">
                                <AlertError
                                    errors={[formError]}
                                    title="Unable to save vendor"
                                />
                            </div>
                        ) : null}
                    </div>
                    <SheetFooter>
                        <Button
                            variant="outline"
                            disabled={formProcessing}
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={formProcessing} onClick={submit}>
                            {formProcessing ? 'Saving...' : 'Save vendor'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <Dialog
                open={viewing !== null}
                onOpenChange={(open) => {
                    if (!open) setViewing(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {viewing?.name ?? 'Vendor details'}
                        </DialogTitle>
                        <DialogDescription>
                            Vendor record and contact details.
                        </DialogDescription>
                    </DialogHeader>
                    {viewing ? (
                        <dl className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Email address
                                </dt>
                                <dd>{viewing.email ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Phone
                                </dt>
                                <dd>{viewing.phone ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Mobile
                                </dt>
                                <dd>{viewing.mobile ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Company
                                </dt>
                                <dd>{viewing.company ?? '—'}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm text-muted-foreground">
                                    Address
                                </dt>
                                <dd className="whitespace-pre-wrap">
                                    {viewing.address ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Created
                                </dt>
                                <dd>
                                    {viewing.createdAt
                                        ? new Date(
                                              viewing.createdAt,
                                          ).toLocaleString()
                                        : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Updated
                                </dt>
                                <dd>
                                    {viewing.updatedAt
                                        ? new Date(
                                              viewing.updatedAt,
                                          ).toLocaleString()
                                        : '—'}
                                </dd>
                            </div>
                        </dl>
                    ) : null}
                </DialogContent>
            </Dialog>
            {deleteError ? (
                <div className="px-4 pb-4">
                    <AlertError
                        errors={[deleteError]}
                        title="Unable to delete vendor"
                    />
                </div>
            ) : null}
            {bulkDeleteError ? (
                <div className="px-4 pb-4">
                    <AlertError
                        errors={[bulkDeleteError]}
                        title="Unable to delete vendors"
                    />
                </div>
            ) : null}
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteProcessing) {
                        setDeleting(null);
                        setDeleteError(null);
                    }
                }}
                title="Delete vendor?"
                description={`Delete ${deleting?.name ?? 'this vendor'}? This cannot be undone.`}
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                processing={deleteProcessing}
                destructive
                onConfirm={destroy}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={(open) => {
                    if (!open && !bulkDeleteProcessing) {
                        setBulkDeleteOpen(false);
                        setBulkDeleteError(null);
                    }
                }}
                title="Delete selected vendors?"
                description={`This deletes ${selectedIds.length} selected vendor records. This cannot be undone.`}
                confirmLabel={
                    bulkDeleteProcessing ? 'Deleting...' : 'Delete selected'
                }
                processing={bulkDeleteProcessing}
                destructive
                onConfirm={destroySelected}
            />
        </>
    );
}
