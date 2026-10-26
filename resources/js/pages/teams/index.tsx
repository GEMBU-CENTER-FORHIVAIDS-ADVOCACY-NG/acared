import { Head, router } from '@inertiajs/react';
import {
    Eye,
    LogOut,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import LeaveTeamModal from '@/components/leave-team-modal';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    destroy as teamsDestroy,
    index as teamsIndex,
    store as teamsStore,
    switchMethod,
    update as teamsUpdate,
} from '@/routes/teams';
import { destroy as teamsBulkDestroy } from '@/routes/teams/bulk';
import type { Team } from '@/types';

type Paginator = {
    data: Team[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Filters = { q: string; perPage: number; page?: number };

type TeamForm = {
    name: string;
    phone: string;
    mobile: string;
    email: string;
    address: string;
    logo: File | null;
};

const blankForm: TeamForm = {
    name: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    logo: null,
};

type Props = {
    teamList: Paginator | Team[];
    filters?: Filters;
};

export default function TeamsIndex({
    teamList: rawTeams,
    filters = { q: '', perPage: 25 },
}: Props) {
    const paginator: Paginator = Array.isArray(rawTeams)
        ? {
              data: rawTeams,
              current_page: 1,
              last_page: 1,
              per_page: rawTeams.length,
              total: rawTeams.length,
          }
        : rawTeams;

    const [search, setSearch] = useState(filters.q || '');
    const [form, setForm] = useState<TeamForm>(blankForm);
    const [editing, setEditing] = useState<Team | null>(null);
    const [deleting, setDeleting] = useState<Team | null>(null);
    const [viewing, setViewing] = useState<Team | null>(null);
    const [teamLeaving, setTeamLeaving] = useState<Team | null>(null);
    const [leaveTeamDialogOpen, setLeaveTeamDialogOpen] = useState(false);
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const visit = (patch: Partial<Filters>) =>
        router.get(
            teamsIndex.url({
                query: { ...filters, ...patch },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );

    const startCreate = () => {
        setEditing(null);
        setForm(blankForm);
        setDialogOpen(true);
    };

    const startEdit = (item: Team) => {
        setEditing(item);
        setForm({
            name: item.name,
            phone: item.phone ?? '',
            mobile: item.mobile ?? '',
            email: item.email ?? '',
            address: item.address ?? '',
            logo: null,
        });
        setDialogOpen(true);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        };

        if (editing) {
            router.post(
                teamsUpdate.url(editing.slug),
                { ...form, _method: 'patch' },
                options,
            );
        } else {
            router.post(teamsStore.url(), form, options);
        }
    };

    const remove = () => {
        if (!deleting) return;
        router.delete(teamsDestroy.url(deleting.slug), {
            data: { name: deleting.name },
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };

    const bulkRemove = () => {
        router.delete(teamsBulkDestroy.url(), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setBulkConfirmOpen(false);
            },
        });
    };

    const switchTeam = (team: Team) => {
        router.visit(switchMethod(team.slug), {
            preserveScroll: true,
        });
    };

    const openLeaveTeamDialog = (team: Team) => {
        setTeamLeaving(team);
        setLeaveTeamDialogOpen(true);
    };

    return (
        <>
            <Head title="Teams" />

            <div className="flex w-full flex-col space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Teams"
                        description="Manage your teams and team details."
                    />
                    <Button onClick={startCreate} data-test="teams-new-team-button">
                        <Plus className="mr-2 h-4 w-4" /> New team
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            visit({ q: search, page: 1 });
                        }}
                    >
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search teams"
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    {selected.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={() => setBulkConfirmOpen(true)}
                        >
                            Delete selected ({selected.length})
                        </Button>
                    )}
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <input
                                        aria-label="Select all"
                                        type="checkbox"
                                        checked={
                                            paginator.data.length > 0 &&
                                            paginator.data.every((t) =>
                                                selected.includes(t.id),
                                            )
                                        }
                                        onChange={(e) =>
                                            setSelected(
                                                e.target.checked
                                                    ? paginator.data.map(
                                                          (t) => t.id,
                                                      )
                                                    : [],
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead>Team</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginator.data.length ? (
                                paginator.data.map((team) => (
                                    <TableRow key={team.id} data-test="team-row">
                                        <TableCell>
                                            <input
                                                aria-label={`Select ${team.name}`}
                                                type="checkbox"
                                                checked={selected.includes(
                                                    team.id,
                                                )}
                                                onChange={(e) =>
                                                    setSelected(
                                                        e.target.checked
                                                            ? [
                                                                  ...selected,
                                                                  team.id,
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      team.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {team.logo ? (
                                                    <img
                                                        src={team.logo}
                                                        alt=""
                                                        className="size-8 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-8 items-center justify-center rounded bg-muted text-muted-foreground">
                                                        <Users className="size-4" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <span>{team.name}</span>
                                                        {team.isPersonal && (
                                                            <Badge variant="secondary">
                                                                Personal
                                                            </Badge>
                                                        )}
                                                        {team.isCurrent && (
                                                            <Badge variant="outline">
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{team.slug}</span>
                                                        {team.roleLabel && (
                                                            <span>
                                                                • {team.roleLabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{team.phone ?? '—'}</TableCell>
                                        <TableCell>{team.mobile ?? '—'}</TableCell>
                                        <TableCell>{team.email ?? '—'}</TableCell>
                                        <TableCell className="max-w-56 truncate">
                                            {team.address ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {!team.isCurrent && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                switchTeam(team)
                                                            }
                                                        >
                                                            Switch
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setViewing(team)
                                                        }
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    {team.canUpdate !== false && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                startEdit(team)
                                                            }
                                                            data-test="team-edit-button"
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    )}
                                                    {team.canLeave && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openLeaveTeamDialog(
                                                                    team,
                                                                )
                                                            }
                                                            data-test="team-leave-button"
                                                        >
                                                            <LogOut className="mr-2 h-4 w-4" />
                                                            Leave
                                                        </DropdownMenuItem>
                                                    )}
                                                    {team.canDelete && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setDeleting(
                                                                        team,
                                                                    )
                                                                }
                                                                data-test="team-delete-button"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No teams found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>

                <Pagination
                    meta={{
                        currentPage: paginator.current_page,
                        lastPage: paginator.last_page,
                        perPage: paginator.per_page,
                        total: paginator.total,
                    }}
                    onPageChange={(page) => visit({ page })}
                    onPerPageChange={(perPage) => visit({ perPage, page: 1 })}
                />
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] w-full max-w-xl overflow-y-auto">
                    <form onSubmit={submit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>
                                {editing ? 'Edit team' : 'New team'}
                            </DialogTitle>
                            <DialogDescription>
                                {editing
                                    ? 'Update team profile and contact information.'
                                    : 'Create a new team to manage facility and records.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="team-name">Name</Label>
                                <Input
                                    id="team-name"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="team-phone">Phone</Label>
                                <Input
                                    id="team-phone"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="team-mobile">Mobile</Label>
                                <Input
                                    id="team-mobile"
                                    value={form.mobile}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            mobile: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="team-email">Email address</Label>
                                <Input
                                    id="team-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="team-logo">
                                    Logo (JPEG, PNG, or WebP; max 2 MB)
                                </Label>
                                <Input
                                    id="team-logo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            logo: e.target.files?.[0] ?? null,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="team-address">Address</Label>
                                <Textarea
                                    id="team-address"
                                    rows={3}
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            address: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editing ? 'Save changes' : 'Create team'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog
                open={!!viewing}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{viewing?.name}</DialogTitle>
                        <DialogDescription>Team details</DialogDescription>
                    </DialogHeader>
                    {viewing && (
                        <div className="space-y-3 text-sm">
                            {viewing.logo && (
                                <img
                                    src={viewing.logo}
                                    alt=""
                                    className="size-16 rounded object-cover"
                                />
                            )}
                            <div>
                                <span className="text-muted-foreground">Slug: </span>
                                <span className="font-mono">{viewing.slug}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Phone: </span>
                                <span>{viewing.phone ?? '—'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Mobile: </span>
                                <span>{viewing.mobile ?? '—'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email: </span>
                                <span>{viewing.email ?? '—'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Address: </span>
                                <p className="mt-1 whitespace-pre-wrap">
                                    {viewing.address ?? '—'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirm Single Delete */}
            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete team"
                description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={remove}
            />

            {/* Confirm Bulk Delete */}
            <ConfirmDialog
                open={bulkConfirmOpen}
                onOpenChange={setBulkConfirmOpen}
                title="Delete selected teams"
                description={`Are you sure you want to delete ${selected.length} selected team(s)? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={bulkRemove}
            />

            {/* Leave Team Modal */}
            <LeaveTeamModal
                team={teamLeaving}
                open={leaveTeamDialogOpen}
                onOpenChange={setLeaveTeamDialogOpen}
            />
        </>
    );
}

TeamsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Teams',
            href: teamsIndex.url(),
        },
    ],
};
