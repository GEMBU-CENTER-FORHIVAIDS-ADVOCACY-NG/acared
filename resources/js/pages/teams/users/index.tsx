import { Head, router } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    MoreHorizontal,
    Pencil,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination, { type PaginationMeta } from '@/components/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { destroy, index, store, update } from '@/routes/teams/users';
import type { RoleOption, Team, TeamMember, TeamPermissions } from '@/types';

type SpatieRole = {
    id: number;
    name: string;
};

type Props = {
    team: Team;
    members: TeamMember[];
    pagination: PaginationMeta;
    availableTeamRoles: RoleOption[];
    spatieRoles: SpatieRole[];
    permissions: TeamPermissions;
};

type UserForm = {
    name: string;
    email: string;
    password: string;
    team_role: string;
    spatie_roles: number[];
};

const blankForm: UserForm = {
    name: '',
    email: '',
    password: '',
    team_role: 'member',
    spatie_roles: [],
};

export default function TeamUsersIndex({
    team,
    members,
    pagination,
    availableTeamRoles,
    spatieRoles,
    permissions,
}: Props) {
    const getInitials = useInitials();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState<UserForm>(blankForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState<UserForm>(blankForm);
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [editProcessing, setEditProcessing] = useState(false);
    const [editShowPassword, setEditShowPassword] = useState(false);

    const [deletingMember, setDeletingMember] = useState<TeamMember | null>(
        null,
    );
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handlePageChange = (page: number) => {
        router.get(
            index({ team: team.slug }),
            { page, per_page: pagination.perPage },
            { preserveScroll: true },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(index({ team: team.slug }), { page: 1, per_page: perPage });
    };

    const pageTitle = useMemo(() => `Users — ${team.name}`, [team.name]);

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post(
            store({ team: team.slug }),
            {
                name: form.name,
                email: form.email,
                password: form.password,
                team_role: form.team_role,
                spatie_roles: form.spatie_roles,
            },
            {
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onSuccess: () => {
                    setForm(blankForm);
                    setDialogOpen(false);
                    setErrors({});
                    setProcessing(false);
                },
            },
        );
    };

    const handleSpatieRoleToggle = (roleId: number) => {
        setForm((prev) => ({
            ...prev,
            spatie_roles: prev.spatie_roles.includes(roleId)
                ? prev.spatie_roles.filter((id) => id !== roleId)
                : [...prev.spatie_roles, roleId],
        }));
    };

    const handleEditMember = (member: TeamMember) => {
        setEditingMember(member);
        setEditForm({
            name: member.name,
            email: member.email,
            password: '',
            team_role: member.role,
            spatie_roles: (member.spatieRoles ?? [])
                .map(
                    (roleName) =>
                        spatieRoles.find((role) => role.name === roleName)?.id,
                )
                .filter((id): id is number => id !== undefined),
        });
        setEditErrors({});
        setEditShowPassword(false);
        setEditDialogOpen(true);
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingMember) {
            return;
        }

        setEditProcessing(true);

        router.patch(
            update({ team: team.slug, user: editingMember.id }),
            {
                name: editForm.name,
                email: editForm.email,
                password: editForm.password || undefined,
                team_role: editForm.team_role,
                spatie_roles: editForm.spatie_roles,
            },
            {
                preserveScroll: true,
                onError: (errs) => {
                    setEditErrors(errs);
                    setEditProcessing(false);
                },
                onSuccess: () => {
                    setEditForm(blankForm);
                    setEditDialogOpen(false);
                    setEditErrors({});
                    setEditProcessing(false);
                    setEditingMember(null);
                },
            },
        );
    };

    const handleEditSpatieRoleToggle = (roleId: number) => {
        setEditForm((prev) => ({
            ...prev,
            spatie_roles: prev.spatie_roles.includes(roleId)
                ? prev.spatie_roles.filter((id) => id !== roleId)
                : [...prev.spatie_roles, roleId],
        }));
    };

    const handleDeleteMember = () => {
        if (!deletingMember) {
            return;
        }

        setDeleteProcessing(true);
        setDeleteError(null);

        router.delete(destroy({ team: team.slug, user: deletingMember.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingMember(null);
                setDeleteError(null);
            },
            onError: (errs: Record<string, string>) =>
                setDeleteError(
                    Object.values(errs)[0] ?? 'Unable to delete user.',
                ),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <>
            <Head title={pageTitle} />

            <div className="flex w-full flex-col space-y-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Team Users"
                            description={`Manage users belonging to ${team.name}`}
                        />

                        {permissions.canAddMember && (
                            <Button onClick={() => setDialogOpen(true)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add user
                            </Button>
                        )}
                    </div>
                    {deleteError ? (
                        <AlertError
                            errors={[deleteError]}
                            title="Unable to delete user."
                        />
                    ) : null}

                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Team role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="w-12 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            No users found in this team.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        {member.avatar ? (
                                                            <AvatarImage
                                                                src={
                                                                    member.avatar
                                                                }
                                                                alt={
                                                                    member.name
                                                                }
                                                            />
                                                        ) : null}
                                                        <AvatarFallback>
                                                            {getInitials(
                                                                member.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">
                                                        {member.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {member.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {member.role_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {member.spatieRoles &&
                                                member.spatieRoles.length >
                                                    0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.spatieRoles.map(
                                                            (role) => (
                                                                <Badge
                                                                    key={role}
                                                                    variant="outline"
                                                                >
                                                                    {role}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {member.created_at
                                                    ? new Date(
                                                          member.created_at,
                                                      ).toLocaleDateString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(permissions.canUpdateMember ||
                                                    permissions.canRemoveMember) && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                aria-label={`Actions for ${member.name}`}
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {permissions.canUpdateMember && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleEditMember(
                                                                            member,
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            )}
                                                            {permissions.canRemoveMember && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        setDeletingMember(
                                                                            member,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {pagination.lastPage > 1 && (
                        <Pagination
                            meta={pagination}
                            onPageChange={handlePageChange}
                            onPerPageChange={handlePerPageChange}
                        />
                    )}
                </div>
            </div>

            {/* Create User Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add user to team</DialogTitle>
                        <DialogDescription>
                            Create a new user account and add them to{' '}
                            {team.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Full name"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                placeholder="email@example.com"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="Minimum 7 characters"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                    aria-label={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="team_role">Team role</Label>
                            <Select
                                required
                                value={form.team_role}
                                onValueChange={(value) =>
                                    setForm({ ...form, team_role: value })
                                }
                            >
                                <SelectTrigger id="team_role">
                                    <SelectValue placeholder="Select a team role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTeamRoles.map((role) => (
                                        <SelectItem
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.team_role} />
                        </div>

                        {spatieRoles.length > 0 && (
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <div className="flex flex-wrap gap-2">
                                    {spatieRoles.map((role) => {
                                        const isSelected =
                                            form.spatie_roles.includes(role.id);
                                        return (
                                            <Button
                                                key={role.id}
                                                type="button"
                                                variant={
                                                    isSelected
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                aria-pressed={isSelected}
                                                onClick={() =>
                                                    handleSpatieRoleToggle(
                                                        role.id,
                                                    )
                                                }
                                            >
                                                {role.name}
                                                {isSelected && (
                                                    <X className="ml-1 h-3 w-3" />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.spatie_roles} />
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                onClick={() => {
                                    setDialogOpen(false);
                                    setErrors({});
                                    setForm(blankForm);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                {processing ? 'Creating...' : 'Create user'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit user</DialogTitle>
                        <DialogDescription>
                            Update details for {editingMember?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Full name"
                                required
                            />
                            <InputError message={editErrors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="email@example.com"
                                required
                            />
                            <InputError message={editErrors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-password">
                                Password (leave blank to keep current)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="edit-password"
                                    type={
                                        editShowPassword ? 'text' : 'password'
                                    }
                                    value={editForm.password}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="Minimum 7 characters"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                    aria-label={
                                        editShowPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                    onClick={() =>
                                        setEditShowPassword(!editShowPassword)
                                    }
                                >
                                    {editShowPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <InputError message={editErrors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-team_role">Team role</Label>
                            <Select
                                required
                                value={editForm.team_role}
                                onValueChange={(value) =>
                                    setEditForm({
                                        ...editForm,
                                        team_role: value,
                                    })
                                }
                            >
                                <SelectTrigger id="edit-team_role">
                                    <SelectValue placeholder="Select a team role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTeamRoles.map((role) => (
                                        <SelectItem
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={editErrors.team_role} />
                        </div>

                        {spatieRoles.length > 0 && (
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <div className="flex flex-wrap gap-2">
                                    {spatieRoles.map((role) => {
                                        const isSelected =
                                            editForm.spatie_roles.includes(
                                                role.id,
                                            );
                                        return (
                                            <Button
                                                key={role.id}
                                                type="button"
                                                variant={
                                                    isSelected
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                aria-pressed={isSelected}
                                                onClick={() =>
                                                    handleEditSpatieRoleToggle(
                                                        role.id,
                                                    )
                                                }
                                            >
                                                {role.name}
                                                {isSelected && (
                                                    <X className="ml-1 h-3 w-3" />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <InputError message={editErrors.spatie_roles} />
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={editProcessing}
                                onClick={() => {
                                    setEditDialogOpen(false);
                                    setEditErrors({});
                                    setEditForm(blankForm);
                                    setEditingMember(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editProcessing}>
                                {editProcessing && <Spinner />}
                                {editProcessing ? 'Saving...' : 'Save changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deletingMember !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingMember(null);
                    }
                }}
                processing={deleteProcessing}
                title={`Delete "${deletingMember?.name ?? ''}"?`}
                description="This will permanently remove the user from the team and delete their account. This cannot be undone."
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                destructive
                onConfirm={handleDeleteMember}
            />
        </>
    );
}
